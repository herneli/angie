import { Utils, BaseService } from "lisco";
import { PackageDao } from "./PackageDao";
import { PackageVersionDao } from "./PackageVersionDao";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { compare as compareVersions } from "compare-versions";
import { entries } from "lodash";
import { timingSafeEqual } from "crypto";
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
    async initGit(packageCode) {
        let packagePath = repositoryPath + path.sep + packageCode;
        const gitOptions = {
            baseDir: packagePath,
            binary: "git",
        };
        if (fs.existsSync(packagePath)) {
            fs.rmSync(packagePath, { recursive: true });
        }
        fs.mkdirSync(packagePath, { recursive: true });
        const git = simpleGit(gitOptions);
        return [git, packagePath];
    }

    async checkRemoteStatus(code) {
        const packageDao = new PackageDao();
        const [git, packagePath] = await this.initGit(code);
        let packageData = await packageDao.getPackage(code);
        await git.clone(packageData.remote, packagePath);
        const branchSummary = await git.branch({ "--all": null });
        for (let branchCode in branchSummary.branches) {
            let remotePrefix = "remotes/origin/";
            if (branchCode.startsWith("remotes/origin")) {
                let branchData = branchSummary.branches[branchCode];
                const version = branchCode.substring(remotePrefix.length);
                this.dao.updatePackageVersionStatus(code, version, { remote_commit: branchSummary.commit });
            }
        }
        return branchSummary;
    }

    async syncronizeAngieRepository(packageVersion) {
        const [git, packagePath] = await this.initGit(packageVersion.code);
        await git.clone(packageVersion.packageData.remote, packagePath);
        const brachSummary = await git.branch(["-M", packageVersion.version]);
        console.log(brachSummary);
        await this.generatePackageComponents(packageVersion, packagePath, git);

        let commitSummary = await git.commit("Update package: " + packageVersion.code + "-" + packageVersion.version);
        await git.push(["-u", "origin", packageVersion.version]);
        if (commitSummary.commit) {
            this.dao.updatePackageVersionStatus(packageVersion.code, packageVersion.version, {
                local_commit: commitSummary.commit,
                remote_commit: commitSummary.commit,
            });
        }
    }

    async generatePackageComponents(packageVersion, packagePath, git) {
        let gitPath = "docs";
        await git.raw("rm", "-r", "--ignore-unmatch", gitPath);
        let docsPath = packagePath + path.sep + "docs";
        fs.rmSync(docsPath, { recursive: true, force: true });
        fs.mkdirSync(docsPath, { recursive: true });

        let dependenciesPath = docsPath + path.sep + "dependencies.json";
        fs.writeFileSync(dependenciesPath, JSON.stringify(packageVersion.dependencies, null, 4));
        await git.add(dependenciesPath);

        for (const component of packageComponent) {
            if (component.document_types) {
                for (const documentType of component.document_types) {
                    let documentTypePath = docsPath + path.sep + component.table + path.sep + documentType;
                    fs.mkdirSync(documentTypePath, { recursive: true });
                    let documents = await this.dao.getDocumentTypeItems(
                        component.table,
                        documentType,
                        packageVersion.code,
                        packageVersion.version
                    );
                    for (const document of documents) {
                        let documentFilePath = documentTypePath + path.sep + document.code + ".json";
                        fs.writeFileSync(documentFilePath, JSON.stringify(document, null, 4));
                        await git.add(documentFilePath);
                    }
                }
            } else {
                let documentTablePath = docsPath + path.sep + component.table;
                fs.mkdirSync(documentTablePath, { recursive: true });
                let documents = await this.dao.getTableItems(
                    component.table,
                    packageVersion.code,
                    packageVersion.version
                );

                for (const document of documents) {
                    let documentFilePath = documentTablePath + path.sep + document.id + ".json";
                    fs.writeFileSync(documentFilePath, JSON.stringify(document, null, 4));
                    await git.add(documentFilePath);
                }
            }
        }
    }
}
