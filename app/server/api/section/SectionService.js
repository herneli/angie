import { Utils, BaseService } from 'lisco';
import { SectionDao } from './SectionDao';


export class SectionService extends BaseService {

    constructor() {
        super(SectionDao)
    }

    
    async updateMenu(data){
        return await this.dao.updateMenu(data);
    }

    async getMenu(){
        return await this.dao.getMenu();
    }
    
}

