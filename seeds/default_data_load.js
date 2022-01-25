const fs = require("fs").promises;
const path = require("path");

const base = path.resolve(path.join(__dirname, "data"));

const alreadyDeleted = {};

//Lee el directorio data. La estructura del mismo será:
// data
//Opción 1;
//   package@version
//   -- table_name
//    - document_type.json
//    - document_type[.XXX].json
//Opción 2:
//   -- table_name
//    - document_type.json
//    - document_type[.XXX].json
//
// El seed leerá los directorios hijos de data buscando las tablas en las que introducir la información.
// Posteriormente lee los archivos dentro de cada tabla y los procesa insertándolos como documentos con su respectivo doctype.

//Los package llevan @, si se detecta una carpeta como @ en el directorio data se evaluará como paquete, creándolo si no existe e introduciendo
//la información contenida en sus subcarpetas vinculada a ese paquete.

const readTableFolder = async (knex, basedir, table, package_code, package_version) => {
    console.log("-- " + table);

    if (!alreadyDeleted[table]) {
        await knex(table).del(); //Borrar la tabla
        alreadyDeleted[table] = true;
    }

    let files = await fs.readdir(path.join(basedir, table));
    for (const file_name of files) {
        let completeName = path.parse(file_name);
        console.log(" - " + completeName.name);

        if (completeName.ext !== ".json") {
            //Ignorar los que no son JSON
            console.log(`Ignorando archivo ${file_name}. Solo se puede procesar JSON`);
            continue;
        }

        let document_type = completeName.name;
        if (document_type.indexOf(".") !== -1) {
            //Se quitan los puntos por si hay varios archivos con el mismo doctype
            document_type = document_type.split(".")[0];
        }

        const file = await fs.readFile(path.join(basedir, table, file_name), "utf-8");

        try {
            let data = JSON.parse(file);
            if(!Array.isArray(data)){
                data = [data];
            }
            let parsedData = data.map((el) => {
                const obj = {
                    id: el.id,
                    code: el.code,
                    document_type: document_type,
                    data: { ...el },
                };

                if (package_code) obj.package_code = package_code;
                if (package_version) obj.package_version = package_version;

                return obj;
            });

            await knex(table).insert(parsedData);
        } catch (ex) {
            console.error(ex);
        }
    }
};

const readDirFolders = async (path) => {
    const folders = await fs.readdir(path, { withFileTypes: true });
    return folders.filter((el) => el.isDirectory());
};

const createPackage = async (knex, package_code, package_version) => {
    const table = "package";

    const exists = await knex(table).where({ code: package_code }).first();

    if (!exists) {
        await knex(table).insert({ code: package_code });
    }

    await createVersion(knex, package_code, package_version);
};

const createVersion = async (knex, package_code, package_version) => {
    const table = "package_version";

    const exists = await knex(table).where({ code: package_code, version: package_version }).first();

    if (!exists) {
        await knex(table).insert({ code: package_code, version: package_version });
    }
};

exports.seed = async function (knex) {
    const folders = await readDirFolders(base);

    for (const folder of folders) {
        const table = folder.name;
        if (table.indexOf("@") === -1) {
            await readTableFolder(knex, base, table);
        } else {
            const package = folder.name.split("@");
            console.log(table);
            //Create package
            await createPackage(knex, package[0], package[1]);
            //Read package
            const subfolders = await readDirFolders(path.join(base, table));
            for (const subfolder of subfolders) {
                await readTableFolder(knex, path.join(base, table), subfolder.name, package[0], package[1]);
            }
        }
    }
};
