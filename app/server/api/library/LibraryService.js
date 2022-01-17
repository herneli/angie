import { BaseService } from "lisco";
import { LibraryDao } from "./LibraryDao";

export class LibraryService extends BaseService {
    constructor() {
        super(LibraryDao);
    }

    async updateAll(libraries) {
        return await this.dao.updateAll(libraries);
    }

}
