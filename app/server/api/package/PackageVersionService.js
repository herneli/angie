import { Utils, BaseService } from "lisco";
import { PackageDao } from "./PackageDao";
import { PackageVersionDao } from "./PackageVersionDao";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { compare as compareVersions } from "compare-versions";
const repositoryPath = process.cwd() + path.sep + "angie-repository";

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

    async updateRemote(code, version) {
        const packageDao = new PackageDao();
        let packageVersion = await this.dao.getPackageVersion(code, version);
        if (packageVersion) {
            packageVersion.packageData = await packageDao.getPackage(code);
        }
        await this.syncronizeAngieRepository(packageVersion);
        return true;
    }

    async syncronizeAngieRepository(packageVersion) {
        let packagePath = repositoryPath + path.sep + packageVersion.code;
        const gitOptions = {
            baseDir: packagePath,
            binary: "git",
        };
        if (fs.existsSync(packagePath)) {
            fs.rmSync(packagePath, { recursive: true });
        }
        fs.mkdirSync(packagePath, { recursive: true });
        const git = simpleGit(gitOptions);
        await git.clone(packageVersion.packageData.remote, packagePath);
        await git.branch(["-M", packageVersion.version]);

        await this.generatePackageComponents(packageVersion, packagePath, git);

        await git.commit("Update package: " + packageVersion.code + "-" + packageVersion.version);
        await git.push(["-u", "origin", packageVersion.version]);
    }

    async generatePackageComponents(packageData, packagePath, git) {
        let gitPath = "docs";
        await git.raw("rm", "-r", "--ignore-unmatch", gitPath);
        fs.rmSync(packagePath + path.sep + "docs", { recursive: true, force: true });
        fs.mkdirSync(packagePath + path.sep + "docs", { recursive: true });
        for (const component of packageComponent) {
            if (component.document_types) {
                for (const documentType of component.document_types) {
                    let documentTypePath =
                        packagePath + path.sep + "docs" + path.sep + component.table + path.sep + documentType;
                    fs.mkdirSync(documentTypePath, { recursive: true });
                    let documents = await this.dao.getDocumentTypeItems(component.table, documentType);
                    for (const document of documents) {
                        let documentFilePath = documentTypePath + path.sep + document.code + ".json";
                        fs.writeFileSync(documentFilePath, JSON.stringify(document, null, 4));
                        await git.add(documentFilePath);
                    }
                }
            } else {
                let documentTablePath = packagePath + path.sep + "docs" + path.sep + component.table;
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
