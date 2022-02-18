import { default as DefHandlebars } from "handlebars";
import lodash from "lodash";
import * as queryString from "query-string";
import { EntityMapperService } from "../entity_mapper";

import promisedHandlebars from "promised-handlebars";

const Handlebars = promisedHandlebars(DefHandlebars);
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
            not_empty: (...args) => this.reduceOp(args, (a) => !lodash.isEmpty(a)),
            empty: (...args) => this.reduceOp(args, (a) => lodash.isEmpty(a)),
        });
        Handlebars.registerHelper("safe", (inputData) => this.safe(inputData));
        Handlebars.registerHelper("escapeMessage", (inputData) => this.processMessageCarriage(inputData));
        Handlebars.registerHelper("JSONStringify", (inputData) => this.processJsonAsString(inputData));
        Handlebars.registerHelper("applyUnmarshal", (format) => this.getUnmarshal(format));
        Handlebars.registerHelper("applyMarshal", (format) => this.getMarshal(format));
        Handlebars.registerHelper("querystring", (inputData, extraData, ignoreQuestion) =>
            this.parseQueryString(inputData, extraData, ignoreQuestion)
        );
        Handlebars.registerHelper("request_querystring", (inputData) => this.requestQueryString(inputData));
        Handlebars.registerHelper("setHeader", (code, value, format) => this.setHeader(code, value, format));
        Handlebars.registerHelper("setHeaderList", (list) => this.setHeaderList(list));
        Handlebars.registerHelper("groovyList", (inputData) => this.groovyList(inputData));
        Handlebars.registerHelper("generateDestination", (target, mode) => this.generateDestination(target, mode));
        Handlebars.registerHelper("generateEntityCreation", (object) => this.generateEntityCreation(object));
        Handlebars.registerHelper("getTags", (tags) => this.getTags(tags));

        return Handlebars;
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
     *
     * @param {*} target
     * @param {*} mode
     * @returns
     */
    generateDestination(target, mode) {
        if (lodash.isObject(mode)) {
            mode = "direct";
        }

        if (Array.isArray(target) && target.length > 1) {
            return this.safe(`<multicast>
                ${target.map((el) => `<to uri="${mode}:${el}" />`).join("\n")}
            </multicast>`);
        }
        if (!Array.isArray(target) || target.length == 1) {
            return this.safe(`<to uri="${mode}:${target}" />`);
        }
        return "";
    }

    /**
     *
     * @param {*} object
     * @returns
     */
    async generateEntityCreation(object) {
        const appServ = new EntityMapperService();

        const app = await appServ.getEntityMappers(object.app);

        const conditions = (app && app.data && app.data.entities) || [];

        return this.safe(`
        ${this.setHeader("organization", object.organization, "constant")}
        <choice>
            ${conditions
                .map(
                    (cond) => `<when>
                    <simple>$\{headers.message_type\} == "${cond.message_type}"</simple>
                    ${this.setHeader("entity_type", cond.code, "constant")}
                    <setBody><simple>${cond.entity_extraction}</simple></setBody>
                </when>`
                )
                .join("\n")}
            <otherwise>
                ${this.setHeader("entity_type", "unknown", "constant")}
                <setBody><simple>{}</simple></setBody>
            </otherwise>
        </choice>
        <unmarshal><json/></unmarshal>
        <process ref="entityGenerator"/>
        <to uri="mock:store"/>`);
    }

    /**
     * Genera headers en base a los tags del componente
     *
     * @param {*} key
     * @param {*} value
     * @param {*} format
     * @returns
     */
    getTags(tags) {
        return tags && Array.isArray(tags) ? tags.join(",") : "";
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
        if (!code) {
            return "";
        }
        if (value === null || value === undefined) {
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
    parseQueryString(inputData, extraData, ignoreQuestion) {
        let data = inputData;
        if (Array.isArray(inputData)) {
            data = lodash.mapValues(lodash.keyBy(inputData, "code"), "value");
        }
        let extra = extraData;
        if (Array.isArray(extra) && !lodash.isEmpty(extra)) {
            extra = lodash.mapValues(lodash.keyBy(extra, "code"), "value");
            data = { ...extra, ...data };
        }

        let questionMark = "?";
        if (ignoreQuestion === true) {
            questionMark = "";
        }
        return this.safe(
            !lodash.isEmpty(inputData) ? questionMark + encodeURIComponent(queryString.stringify(data)) : ""
        );
    }

    /**
     *
     * @param {*} inputData
     * @returns
     */
    requestQueryString(inputData) {
        let data = inputData;
        if (Array.isArray(inputData)) {
            data = lodash.mapValues(lodash.keyBy(inputData, "code"), "value");
        }
        return this.safe(!lodash.isEmpty(inputData) ? queryString.stringify(data) : "");
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
                return this.safe("<marshal><json/></marshal>");
            case "hl7":
                return this.safe("<marshal><hl7/></marshal>");
            case "xml":
                return this.safe("<marshal><jacksonxml/></marshal>");
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
            case "xml":
                return this.safe("<unmarshal><jacksonxml/></unmarshal>");
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
