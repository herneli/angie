import { BaseService as BaseLiscoService } from "lisco";

export default class BaseService extends BaseLiscoService {
    /**
     * Obtencion de una lista de elementos.
     *
     * filters, es opcional. Si no se pasan se devuelve lo que hay ;
     */
    async list(filters, start, limit) {
        //Pagination
        var start = start || 0;
        var limit = limit || 1000; //Default limit

        const response = await this.dao.loadAllData(filters, start, limit);

        return {
            total: response && response.body && response.body.hits.total.value,
            data: response && response.body && response.body.hits.hits,
        };
    }
}
