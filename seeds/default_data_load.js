const fs = require("fs").promises;
const path = require("path");

//Lee el directorio data. La estructura del mismo será:
// data
//   - table_name
//       - document_type.json
//       - document_type[.XXX].json
//
// El seed leerá los directorios hijos de data buscando las tablas en las que introducir la información.
// Posteriormente lee los archivos dentro de cada tabla y los procesa insertándolos como documentos con su respectivo doctype.
exports.seed = async function (knex) {
    const base = path.resolve(path.join(__dirname, "data"));
    let folders = await fs.readdir(base, { withFileTypes: true });

    folders = folders.filter((dirent) => dirent.isDirectory());

    for (const folder of folders) {
        const table = folder.name;
        console.log(table);

        await knex(table).del(); //Borrar la tabla

        let files = await fs.readdir(path.join(base, table));
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

            const file = await fs.readFile(path.join(base, table, file_name), "utf-8");

            try {
                const data = JSON.parse(file);
                let parsedData = data.map((el) => {
                    return {
                        id: el.id,
                        code: el.code,
                        document_type: document_type,
                        data: { ...el },
                    };
                });

                await knex(table).insert(parsedData);
            } catch (ex) {
                console.error(ex);
            }
        }
    }
};
