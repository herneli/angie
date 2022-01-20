import Handlebars from "handlebars";
import lodash from "lodash";
import * as queryString from "query-string";

class ChannelHandlebarsHelpers {
    /**
     * Carga los helpers necesarios para las conversiones en los canales
     */
    configure() {
        Handlebars.registerHelper({
            eq: (...args) => this.reduceOp(args, (a, b) => a === b),
            ne: (...args) => this.reduceOp(args, (a, b) => a !== b),
            lt: (...args) => this.reduceOp(args, (a, b) => a < b),
            gt: (...args) => this.reduceOp(args, (a, b) => a > b),
            lte: (...args) => this.reduceOp(args, (a, b) => a <= b),
            gte: (...args) => this.reduceOp(args, (a, b) => a >= b),
            and: (...args) => this.reduceOp(args, (a, b) => a && b),
            or: (...args) => this.reduceOp(args, (a, b) => a || b),
        });
        Handlebars.registerHelper("safe", (inputData) => this.safe(inputData));
        Handlebars.registerHelper("escapeMessage", (inputData) => this.processMessageCarriage(inputData));
        Handlebars.registerHelper("JSONStringify", (inputData) => this.processJsonAsString(inputData));
        Handlebars.registerHelper("applyUnmarshal", (format) => this.getUnmarshal(format));
        Handlebars.registerHelper("applyMarshal", (format) => this.getMarshal(format));
        Handlebars.registerHelper("querystring", (inputData, extraData) => this.parseQueryString(inputData, extraData));
        Handlebars.registerHelper("setHeader", (code, value, format) => this.setHeader(code, value, format));
        Handlebars.registerHelper("setHeaderList", (list) => this.setHeaderList(list));
        Handlebars.registerHelper("groovyList", (inputData) => this.groovyList(inputData));
    }

    /**
     * Convierte una lista de elementos JS en una lista Groovy como String para enviar a Camel
     *
     * @param {*} inputData
     * @returns
     */
    groovyList(inputData) {
        if (lodash.isEmpty(inputData)) {
            return "[]";
        }
        let data = inputData;
        return this.safe(JSON.stringify(data).replace(/{/g, "[").replace(/}/g, "]"));
    }

    /**
     * Devuelve el xml necesario para establecer un header.
     *
     * Posibles valores format:
     *
     * - constant
     * - simple
     * - header
     *
     * @param {*} key
     * @param {*} value
     * @param {*} format
     * @returns
     */
    setHeader(code, value, format) {
        if (!format) {
            format = "constant";
        }
        if (!code || !value) {
            return "";
        }
        return this.safe(`<setHeader name="${code}"><${format}>${value}</${format}></setHeader>`);
    }

    /**
     * Devuelve el xml de una lista de headers
     *
     * @param {*} list
     * @returns
     */
    setHeaderList(list) {
        return this.safe(lodash.map(list, ({ code, value, format }) => this.setHeader(code, value, format)).join("\n"));
    }

    /**
     * Devuelve el string tal cual, sin procesar, asumiendo que se trata de algo seguro.
     *
     * @param {*} inputData
     * @returns
     */
    safe(inputData) {
        return new Handlebars.SafeString(inputData);
    }

    /**
     * Convierte un objeto o array (inputData) en un query String. Añade al final de este el contenido de extraData procesándolo de la misma forma.
     *
     * Las propiedades de inputData sobreescriben a extraData en caso de que exista alguna duplicada.
     *
     * Se permiten dos posibles formatos en ambos parámetros:
     *
     * - objeto : { clave: valor }
     * - array: [ {code: clave, value: valor}, ... ]
     *
     * El resultado es un string:
     *
     * ?clave=valor&clave2=valor2
     *
     *
     * @param {*} inputData
     * @param {*} extraData
     * @returns
     */
    parseQueryString(inputData, extraData) {
        let data = inputData;
        if (Array.isArray(inputData)) {
            data = lodash.mapValues(lodash.keyBy(inputData, "code"), "value");
        }
        let extra = extraData;
        if (Array.isArray(extra) && !lodash.isEmpty(extra)) {
            extra = lodash.mapValues(lodash.keyBy(extra, "code"), "value");
            data = { ...extra, ...data };
        }

        return this.safe(!lodash.isEmpty(inputData) ? "?" + encodeURIComponent(queryString.stringify(data)) : "");
    }

    /**
     * Obtiene en base a un formato el xml necesario para realizar un marshalling
     *
     *
     * https://camel.apache.org/components/3.13.x/eips/marshal-eip.html
     *
     * @param {*} format
     * @returns
     */
    getMarshal(format) {
        switch (format) {
            case "json":
                return "<marshal><json/></marshal>";
            case "hl7":
                return "<marshal><hl7/></marshal>";
            default:
                return "";
        }
    }

    /**
     * Obtiene en base a un formato el xml necesario para realizar un unmarshalling
     *
     * https://camel.apache.org/components/3.13.x/eips/unmarshal-eip.html
     *
     * @param {*} format
     * @returns
     */
    getUnmarshal(format) {
        switch (format) {
            case "json":
                return this.safe("<unmarshal><json/></unmarshal>");
            case "hl7":
                return this.safe("<unmarshal><hl7/></unmarshal>");
            default:
                return "";
        }
    }

    /**
     * Convierte un String a JSON
     * @param {*} msg
     * @returns
     */
    processJsonAsString(msg) {
        try {
            return this.safe(JSON.stringify(msg));
        } catch (ex) {
            console.error(ex);
        }
        return "";
    }

    /**
     * Escapa los saltos de carro y de linea de un mensaje de forma que lleguen a camel tal cual deberían.
     *
     *
     * @param {*} msg
     * @returns
     */
    processMessageCarriage(msg) {
        return this.safe(msg.replace(/\r\n|\n\r|\n|\r/g, "\\r\\n"));
    }

    /**
     * FROM here: https://gist.github.com/servel333/21e1eedbd70db5a7cfff327526c72bc5
     */
    reduceOp(args, reducer) {
        args = Array.from(args);
        args.pop(); // => options
        const first = args.shift();
        return args.reduce(reducer, first);
    }
}

export default new ChannelHandlebarsHelpers();
