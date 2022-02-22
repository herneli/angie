import { Utils, BaseService } from "lisco";
import { PackageDao } from "./PackageDao";
import { PackageVersionDao } from "./PackageVersionDao";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { v4 as uuid_v4 } from "uuid";
import { PackageService } from "./PackageService";

const DEPENDENCIES_FILE = "dependencies.json";
const DOCS_FOLDER = "docs";
const repositoryPath = process.cwd() + path.sep + "angie-repository";
const packageComponent = [
    {
        table: "script_config",
        document_types: ["context", "object", "method"],
        id_mode: "id",
    },
    {
        table: "integration_config",
        document_types: ["node_type", "entity_mapper"],
        id_mode: "uuid",
    },
    {
        table: "integration",
        document_types: null,
        id_mode: "uuid",
    },
];

export class PackageVersionService extends BaseService {
    constructor() {
        super(PackageVersionDao);
    }

    async getPackageVersionList(code) {
        return await this.dao.getPackageVersionList(code);
    }

    async getPackagesWithVersions() {
        const data = await this.dao.getPackagesWithVersions();

        return data.map((el) => {
            el.abbreviation = `${el.code}@${el.version}`;
            return el;
        });
    }

    async getPackageVersion(code, version) {
        return await this.dao.getPackageVersion(code, version);
    }
    async createPackageVersion(data) {
        return await this.dao.createPackageVersion(data);
    }
    async deletePackageVersions(code) {
        let packageVersions = await this.dao.getPackageVersionList(code);
        for (let packageVersion of packageVersions) {
            await this.deletePackageVersion(packageVersion.code, packageVersion.version);
        }
    }

    async deletePackageVersion(code, version) {
        await this.deletePackageComponents(code, version);
        await this.dao.deletePackageVersion(code, version);
        return true;
    }

    async publishVersion(code, version) {
        let packageVersion = await this.dao.getPackageVersion(code, version);
        await this.publishAngiePackage(packageVersion);
        return true;
    }

    async copyVersion(code, version, newVersion) {
        let packageVersion = await this.dao.getPackageVersion(code, version);
        if (packageVersion.packageData.remote) {
            return await this.copyVersionRemote(packageVersion, newVersion);
        } else {
            return await this.copyVersionLocal(packageVersion, newVersion);
        }
    }
    async updateVersionDependencies(code, version, dependencies) {
        await this.dao.updatePackageDependencies(code, version, dependencies);
    }

    async getRemoteList() {
        const packageDao = new PackageDao();
        const localPackages = await packageDao.getPackageList();
        const [git, packagePath] = await this.initGit("angie-packages");
        await git.clone(process.env.PACKAGE_REPOSITORY, packagePath);
        await git.checkout("main");
        let packageList = fs.readFileSync(packagePath + path.sep + "angie_packages.json");
        packageList = JSON.parse(packageList);

        Object.entries(packageList).forEach(([code, entry]) => {
            let localPackage = localPackages.find((packageData) => packageData.code === code);
            packageList[code]["local"] = !!localPackage;
        });

        return packageList;
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

    async updateRemoteStatus(code) {
        const packageDao = new PackageDao();
        const [git, packagePath] = await this.initGit(code);
        let packageData = await packageDao.getPackage(code);
        await git.clone(packageData.remote, packagePath);
        const branchSummary = await git.branch({ "--all": null });
        let remoteBranchCount = 0;
        for (let branchCode in branchSummary.branches) {
            let remotePrefix = "remotes/origin/";
            if (branchCode.startsWith("remotes/origin")) {
                remoteBranchCount++;
                let branchData = branchSummary.branches[branchCode];
                const version = branchCode.substring(remotePrefix.length);
                this.dao.updatePackageVersionStatus(code, version, { remote_commit: branchData.commit });
            }
        }

        if (remoteBranchCount === 0) {
            let firstVersion = await this.dao.getPackageVersion(code, "1.0.0");
            if (!firstVersion) {
                this.dao.updatePackageVersionStatus(code, "1.0.0", {
                    local_commit: "initial",
                    remote_commit: "initial",
                });
            }
        }
        return { git, packagePath, branchSummary };
    }

    async publishAngiePackage(packageVersion) {
        let status = await this.updateRemoteStatus(packageVersion.code);
        const { git, packagePath } = status;
        if (packageVersion.remote_commit === "initial") {
            await git.branch(["-M", packageVersion.version]);
        } else {
            const brachSummary = await git.checkout(packageVersion.version);
        }
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

    async importAngiePackage(code, version) {
        let status = await this.updateRemoteStatus(code);
        const { git, packagePath } = status;
        let packageVersion = await this.dao.getPackageVersion(code, version);
        const brachSummary = await git.checkout(packageVersion.version);
        await this.importPackageComponents(packageVersion, packagePath, git);
        console.log(brachSummary);
        this.dao.updatePackageVersionStatus(packageVersion.code, packageVersion.version, {
            local_commit: packageVersion.remote_commit,
        });
    }

    async copyVersionRemote(packageVersion, newVersion) {
        let status = await this.updateRemoteStatus(packageVersion.code);
        const { git, packagePath } = status;
        await git.checkout(packageVersion.version);
        await git.branch(["-c", packageVersion.version, newVersion.version]);
        await git.push(["-u", "origin", newVersion.version]);
        await this.importPackageComponents({ ...packageVersion, ...newVersion }, packagePath, git);
        this.dao.updatePackageVersionStatus(packageVersion.code, newVersion.version, {
            remote_commit: packageVersion.remote_commit,
            local_commit: packageVersion.remote_commit,
        });
    }

    async copyVersionLocal(packageVersion, newVersion) {
        for (const component of packageComponent) {
            if (component.document_types) {
                for (const documentType of component.document_types) {
                    let documents = await this.dao.getDocumentTypeItems(
                        component.table,
                        documentType,
                        packageVersion.code,
                        packageVersion.version
                    );
                    for (const document of documents) {
                        if (component.id_mode === "uuid") {
                            document.id = uuid_v4();
                        } else {
                            delete document.id;
                        }
                        await this.dao.insertDocumentTypeItem(
                            component.table,
                            documentType,
                            packageVersion.code,
                            newVersion.version,
                            document
                        );
                    }
                }
            } else {
                let documents = await this.dao.getTableItems(
                    component.table,
                    packageVersion.code,
                    packageVersion.version
                );

                for (const document of documents) {
                    if (component.id_mode === "uuid") {
                        document.id = uuid_v4();
                    } else {
                        delete document.id;
                    }
                    await this.dao.insertTableItem(component.table, packageVersion.code, newVersion.version, document);
                }
            }
        }
        this.dao.updatePackageVersionStatus(packageVersion.code, newVersion.version, {
            dependencies: JSON.stringify(packageVersion.dependencies),
        });
    }

    async generatePackageComponents(packageVersion, packagePath, git) {
        let gitPath = DOCS_FOLDER;
        await git.raw("rm", "-r", "--ignore-unmatch", gitPath);
        let docsPath = packagePath + path.sep + DOCS_FOLDER;
        fs.rmSync(docsPath, { recursive: true, force: true });
        fs.mkdirSync(docsPath, { recursive: true });

        let dependenciesPath = docsPath + path.sep + DEPENDENCIES_FILE;
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

    async deletePackageComponents(code, version) {
        for (const component of packageComponent) {
            if (component.document_types) {
                for (const documentType of component.document_types) {
                    await this.dao.deleteDocumentTypeItems(component.table, documentType, code, version);
                }
            } else {
                await this.dao.deleteTableItems(component.table, code, version);
            }
        }
    }

    async importPackageComponents(packageVersion, packagePath, git) {
        let docsPath = packagePath + path.sep + DOCS_FOLDER;
        let dependencies = fs.readFileSync(docsPath + path.sep + DEPENDENCIES_FILE);
        dependencies = JSON.parse(dependencies);

        await this.dao.updatePackageDependencies(packageVersion.code, packageVersion.version, dependencies);

        await this.deletePackageComponents(packageVersion.code, packageVersion.version);

        for (const component of packageComponent) {
            if (component.document_types) {
                for (const documentType of component.document_types) {
                    let documentTypePath = docsPath + path.sep + component.table + path.sep + documentType;
                    console.log("path: " + documentTypePath);
                    if (fs.existsSync(documentTypePath)) {
                        let configFiles = fs.readdirSync(documentTypePath).filter((file) => file.endsWith(".json"));
                        for (const configFile of configFiles) {
                            console.log("file: " + configFile);
                            let entry = fs.readFileSync(documentTypePath + path.sep + configFile);
                            entry = JSON.parse(entry);
                            if (component.id_mode === "uuid") {
                                entry.id = uuid_v4();
                            } else {
                                delete entry.id;
                            }
                            await this.dao.insertDocumentTypeItem(
                                component.table,
                                documentType,
                                packageVersion.code,
                                packageVersion.version,
                                entry
                            );
                        }
                    }
                }
            } else {
                let documentTablePath = docsPath + path.sep + component.table;
                console.log("path: " + documentTablePath);

                if (fs.existsSync(documentTablePath)) {
                    let configFiles = fs.readdirSync(documentTablePath).filter((file) => file.endsWith(".json"));
                    for (const configFile of configFiles) {
                        let entry = fs.readFileSync(documentTablePath + path.sep + configFile);
                        entry = JSON.parse(entry);
                        if (component.id_mode === "uuid") {
                            entry.id = uuid_v4();
                        } else {
                            delete entry.id;
                        }
                        await this.dao.insertTableItem(
                            component.table,
                            packageVersion.code,
                            packageVersion.version,
                            entry
                        );
                    }
                }
            }
        }
    }
}
