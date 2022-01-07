import { Utils, BaseService } from "lisco";
import { PackageVersionDao } from "./PackageVersionDao";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { compare as compareVersions } from "compare-versions";

const remoteRepository = "git@github.com:hernaj34/angie-repository.git";
const repositoryPath = process.cwd() + path.sep + "angie-repository";
const angieFilePath = repositoryPath + path.sep + "angie.json";
const gitOptions = {
    baseDir: repositoryPath,
    binary: "git",
};

const packageComponent = [
    {
        table: "script_config",
        document_types: ["context", "object", "method"],
    },
    {
        table: "integration_config",
        document_types: ["camel_component", "node_type"],
    },
    {
        table: "integration",
        document_types: null,
    },
];

export class PackageVersionService extends BaseService {
    constructor() {
        super(PackageVersionDao);
    }

    async getPackageVersionList(code) {
        return await this.dao.getPackageVersionList(code);
    }

    async getPackageVersion(code, version) {
        return await this.dao.getPackageVersion(code, version);
    }

    async updateRemote(id) {
        let packageData = await this.dao.loadById(id);
        if (packageData) {
            packageData = packageData[0];
        }
        await this.syncronizeAngieRepository(packageData);
        return true;
    }

    async syncronizeAngieRepository(packageData) {
        if (fs.existsSync(repositoryPath)) {
            fs.rmSync(repositoryPath, { recursive: true });
        }
        fs.mkdirSync(repositoryPath);
        const git = simpleGit(gitOptions);
        await git.clone(remoteRepository, repositoryPath);
        await git.pull();

        let angieFile = fs.readFileSync(angieFilePath);
        let angieConfig = JSON.parse(angieFile);

        if (angieConfig.packages[packageData.code]) {
            let angiePackage = angieConfig.packages[packageData.code];
            if (!angiePackage.versions.includes(packageData.version)) {
                angiePackage.versions.push(packageData.version);
                if (compareVersions(angiePackage.latest, packageData.version, "<=")) {
                    angiePackage.latest = packageData.version;
                }
            }
        } else {
            angieConfig.packages[packageData.code] = {
                versions: [packageData.version],
                latest: packageData.version,
            };
        }
        fs.writeFileSync(angieFilePath, JSON.stringify(angieConfig, null, 4));
        await git.add(angieFilePath);

        await this.generatePackageComponents(packageData, git);

        await git.commit("Update package: " + packageData.code + "-" + packageData.version);
        await git.push("origin");
    }

    async generatePackageComponents(packageData, git) {
        let packagePath = repositoryPath + path.sep + packageData.code + path.sep + packageData.version;
        let gitPath = packageData.code + "/" + packageData.version;
        await git.raw("rm", "-r", "--ignore-unmatch", gitPath);
        fs.rmSync(packagePath, { recursive: true, force: true });
        fs.mkdirSync(packagePath, { recursive: true });
        for (const component of packageComponent) {
            if (component.document_types) {
                for (const documentType of component.document_types) {
                    let documentTypePath = packagePath + path.sep + component.table + path.sep + documentType;
                    fs.mkdirSync(documentTypePath, { recursive: true });
                    let documents = await this.dao.getDocumentTypeItems(component.table, documentType);
                    for (const document of documents) {
                        let documentFilePath = documentTypePath + path.sep + document.code + ".json";
                        fs.writeFileSync(documentFilePath, JSON.stringify(document, null, 4));
                        await git.add(documentFilePath);
                    }
                }
            } else {
                let documentTablePath = packagePath + path.sep + component.table;
                fs.mkdirSync(documentTablePath, { recursive: true });
                let documents = await this.dao.getTableItems(component.table);

                for (const document of documents) {
                    let documentFilePath = documentTablePath + path.sep + document.id + ".json";
                    fs.writeFileSync(documentFilePath, JSON.stringify(document, null, 4));
                    await git.add(documentFilePath);
                }
            }
        }
    }
}
