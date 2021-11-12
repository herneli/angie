import { Utils, BaseService } from "lisco";
import { ConfigurationDao } from "./ConfigurationDao";

export class ConfigurationService extends BaseService {
    constructor() {
        super(ConfigurationDao);
    }

    getModel(code) {
        return this.dao.getModel(code);
    }

    getModelDataList(code, filter) {
        return this.dao.getModelDataList(code, filter);
    }

    getModelData(code, id) {
        return this.dao.getModelData(code, id);
    }

    createModelData(code, model) {
        return this.dao.createModelData(code, model);
    }

    updateModelData(code, id, model) {
        return this.dao.updateModelData(code, id, model);
    }

    deleteModelData(code, id) {
        return this.dao.deleteModelData(code, id);
    }
}
