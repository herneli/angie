import { Utils, BaseService, App } from "lisco";
import { ConfigurationDao } from "./ConfigurationDao";
import { v4 as uuid_v4 } from "uuid";

export class ConfigurationService extends BaseService {
    constructor() {
        super(ConfigurationDao);
    }

    getModel(code) {
        return this.dao.getModel(code);
    }

    getModelDataByCode(code, docCode) {
        return this.dao.getModelDataByCode(code, docCode);
    }
    getModelData(code, id) {
        return this.dao.getModelData(code, id);
    }

    async save(code, body) {
        const model = await this.getModel(code);
        let entity = {
            id: body.id,
            document_type: model.data.documentType,
            code: body.code ? body.code : model.data.code,
            data: body,
        };
        if (body.package_code) {
            entity = { ...entity, package_code: body.package_code, package_version: body.package_version };
        }
        if (!entity.id && model.data.id_mode && model.data.id_mode === "uuid") {
            entity.id = uuid_v4(); //Por defecto se usa el increments pero se puede personalizar para que la tabla de configuracion utilice uuid
        } else if (!model.data.id_mode || model.data.id_mode !== "uuid") {
            delete entity.id;
        }
        const res = await super.save(entity);
        App.events.emit("config_saved_" + code, { body });
        return res;
    }

    async update(code, id, body) {
        const model = await this.getModel(code);
        let entity = {
            document_type: model.data.documentType,
            code: body.code,
            id: id,
            data: body,
        };
        const exists = await this.getModelData(code, id);
        if (!exists) {
            return this.save(code, body); //Si no existe se crea
        }

        const res = await super.update(id, entity);

        App.events.emit("config_updated_" + code, { body });
        return res;
    }

    async list(code, filters, start, limit) {
        const model = await this.getModel(code);

        if (model.data.relation_schema) {
            return this.listWithRelations(code, filters, start, limit);
        }

        if (!filters) {
            filters = {};
        }
        if (!filters.sort) {
            filters.sort = { field: "code", direction: "ascend" };
        }
        filters.document_type = model.data.documentType;

        const res = await super.list(filters, start, limit);
        return res;
    }

    async listWithRelations(code, filters, start, limit) {
        const model = await this.getModel(code);
        //Pagination
        var start = start || 0;
        var limit = limit || 1000; //Default limit

        if (!filters) {
            filters = {};
        }
        if (!filters.sort) {
            // filters.sort = { field: "code", direction: "ascend" };
        }
        filters[`${model.data.table}.document_type`] = model.data.documentType;

        const relation_config = {
            relation_schema: model.data.relation_schema || {},
            selectQuery: model.data.selectQuery || "",
            group_by: model.data.group_by,
        };

        let res = {};
        res.total = await this.dao.countFilteredData(filters, start, limit);

        let filteredData = await this.dao.loadFilteredDataWithRelations(filters, start, limit, relation_config);
        res.data = filteredData;

        let relations = model.data.relation_schema || {};
        res.data.forEach((element) => {
            if (!Array.isArray(relations)) {
                relations = [relations];
            }
            relations.forEach((relation) => {
                element.data[relation.relation_column] = element[relation.relation_column];
            });
        });

        return res;
    }

    async delete(code, id) {
        await this.getModel(code);
        const res = await super.delete(id);
        App.events.emit("config_deleted_" + code, { body: { id } });
        return res;
    }
}
