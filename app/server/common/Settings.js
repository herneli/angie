import fs from "fs";
import path from "path";
import nconf from "nconf";

export default class Settings {
    cfgFileName = "configuration.json";
    baseCfgFileName = "baseconfig.json";

    baseSettings = {};

    configure() {}

    /**
     *
     * @returns {Settings}
     */
    load() {
        var baseRaw = fs.readFileSync(path.resolve(process.cwd(), this.baseCfgFileName), "utf8");
        this.baseSettings = JSON.parse(baseRaw);

        nconf.file(path.resolve(process.cwd(), this.cfgFileName));

        nconf.defaults({
            "core.keycloak": {
                //Default from .env
                url: process.env.KEYCLOAK_URL,
                realm: process.env.KEYCLOAK_REALM,
                "front-client": process.env.KEYCLOAK_FRONT_CLI,
            },
            ...this.baseSettings,
        });

        return this;
    }

    /**
     *
     * @param key
     * @returns {string}
     */
    getConfigValue(key) {
        var record = "";
        var userConfig = nconf.get("user"); //TODO cargar el perfil de user de la BD
        record = userConfig ? userConfig[key] : null;
        if (record === null || record === undefined) {
            record = nconf.get(key);
            if (record === null || record === undefined) {
                console.log("Value not configured: " + key);
            }
        }

        return record !== null ? record : "";
    }

    /**
     * Devuelve todos los parametros de configuracion de la aplicacion
     * @returns {Provider}
     */
    getAllConfigValues() {
        return nconf.get();
    }

    /**
     * Setter para cambiar un valor de config
     */
    setConfigValue(key, value) {
        nconf.set(key, value);
    }

    /**
     * Persiste las modificaciones en la configuracion
     */
    saveConfigModifications(callback) {
        // nconf.use('cfg');
        nconf.save(function (err) {
            if (err) {
                if (callback) callback(err);
                console.error(err);
            }
            if (callback) callback(null);
        });
    }

    //TODO cargar las settings de la base de datos
}
