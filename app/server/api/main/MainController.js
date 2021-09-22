import { App, BaseController, JsonResponse } from 'lisco';
import { Utils } from '../../common'
import path from 'path'

const asyncHandler = require('express-async-handler')

export class MainController extends BaseController {

    configure() {

        this.router.get('/', (res, req, next) => { this.index(res, req, next); });
        this.router.get('/translation', (res, req, next) => { this.translation(res, req, next); });
        this.router.get('/config', (res, req, next) => { this.config(res, req, next); });
        this.router.get('/memory', (res, req, next) => { this.memory(res, req, next); });

        this.router.get('/log/:log', this.loadLog.bind(this.loadLog));

        return this.router;
    }

    /**
     * Render para el index del frontend
     * 
     * @param request
     * @param response
     */
    index(request, response) {
        var filePath = path.resolve("app/statics/html/index.html");
        response.sendFile(filePath);
    }

    /**
     * Metodo interno para la obtencion de las traducciones.
     *
     */
    translation(request, response) {

        var jsRes = new JsonResponse();
        jsRes.success = true;
        jsRes.data = App.i18n.currentData[request.query.lang || process.env.DEFAULT_LANG];;
        response.json(jsRes);
    }

    /**
     * Metodo interno para la obtencion de las configuraciones
     *
     */
    config(request, response) {
        response.json(Utils.flattenObject(App.settings.getAllConfigValues()));
    }

    memory(request, response) {
        var used = process.memoryUsage();
        var data = {};
        for (var key in used) {
            data[key] = parseFloat(Math.round(used[key] / 1024 / 1024 * 100) / 100) + " Mb";
        }

        response.json(data);
    }

    /**
     * Muestra los logs de la aplicacion
     * 
     * @param {*} request 
     * @param {*} response 
     */
    loadLog(request, response) {
        var shell = require('shelljs');

        var jsRes = new JsonResponse();
        try {
            var suffix = '';
            if (request.query.suffix) {
                suffix = '-' + request.query.suffix;
            }

            var filepattern = 'logs/' + request.params.log + suffix + '.log';

            //TODO use grep to make a search field
            // var searchResult = shell.grep('-i', request.params.searchFilter || "", filepattern);
            var result = shell.tail({ '-n': 300 }, filepattern);

            jsRes.success = true;
            jsRes.data = result;

        } catch (ex) {
            jsRes.success = false;
            jsRes.message = ex.toString();
            console.error(ex);
        }

        response.json(jsRes);

    }
}
