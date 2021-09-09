var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

export default class Settings {

    cfgFileName = 'configuration.json'
    baseCfgFileName = 'baseconfig.json'

    baseSettings = {}

    configure() {
    }

    /**
     *
     * @returns {Settings}
     */
    load() {
        var baseRaw = fs.readFileSync(path.resolve(process.cwd(), this.baseCfgFileName), 'utf8');
        this.baseSettings = JSON.parse(baseRaw);

        nconf.file(path.resolve(process.cwd(), this.cfgFileName));

        nconf.defaults(this.baseSettings);

        return this;
    }

    loadDB(callback) {
        global.con.query('SELECT * FROM settings', function (err, data) {
            if (err) return callback(err);
            // nconf.use('cfg');
            for (var i = 0; i < data.rows.length; i++) {
                nconf.set(data.rows[i].cfg_key, data.rows[i].cfg_value);
            }
            if (callback) return callback();
        });
    }

    /**
     *
     * @param key
     * @returns {string}
     */
    getConfigValue(key) {
        var record = "";
        // nconf.use('cfg');
        var userConfig = nconf.get('user');
        record = userConfig ? userConfig[key] : null;
        if (record === null || record === undefined) {
            record = nconf.get(key);
            if (record === null || record === undefined) {
                console.log('Value not configured: ' + key);

            }
        }

        return record !== null ? record : '';
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

    /**
     * Comprueba que existe el archivo especial para activar el debug
     */
    checkDebug(callback) {
        fs.readFile(path.resolve(path.dirname(require.main.filename), ".debug"), 'utf8', function (err, data) {
            if (err) return callback(false);

            if (data && data === "true") return callback(true);
        });
    }

    updateUserConfig(configs, callback) {
        this.load();
        this.loadDB(function () {
            if (configs.length !== 0) {
                //     nconf.set('user', {});
                // } else {
                // var userConf = nconf.get('user') ? nconf.get('user') : {};
                for (var idx in configs) {
                    // userConf[configs[idx].cfg_key] = configs[idx].cfg_value;
                    nconf.set(configs[idx].cfg_key, configs[idx].cfg_value)
                }
                // nconf.add('user', { type: 'literal', store: userConf });
            }
            if (callback) return callback();
        });


    }

}

