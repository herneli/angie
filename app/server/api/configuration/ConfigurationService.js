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

    getModelData(code, id) {
        return this.dao.getModelData(code, id);
    }

    async save(code, body) {
        const model = await this.getModel(code);
        let entity = {
            document_type: model.data.documentType,
            code: body.code ? body.code : model.data.code,
            data: body,
        };
        if (model.data.id_mode && model.data.id_mode === "uuid") {
            entity.id = uuid_v4(); //Por defecto se usa el increments pero se puede personalizar para que la tabla de configuracion utilice uuid
        }
        const res = await super.save(entity);
        App.events.emit("config_saved" + code, { body });
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
        const res = await super.update(id, entity);

        App.events.emit("config_updated_" + code, { body });
        return res;
    }

    async list(code, filters, start, limit) {
        const model = await this.getModel(code);

        if (!filters) {
            filters = {};
        }
        filters.sort = { field: "code", direction: "ascend" };
        filters.document_type = model.data.documentType;

        const res = await super.list(filters, start, limit);
        return res;
    }

    
    async listWithRelations(code, filters, start, limit, relations,selectQuery) {
        const model = await this.getModel(code);

        if (!filters) {
            filters = {};
        }
        // filters.sort = { field: "code", direction: "ascend" };
        let res = await super.listWithRelations(filters, start, limit,relations,selectQuery);

        res.data.forEach(element => {
            if(Array.isArray(relations)){
                relations.forEach(relation => {
                    element.data[relation.relationColumn] = element[relation.relationColumn]
                })
            }else{
                element.data[relations.relationColumn] = element[relations.relationColumn]
            }
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
