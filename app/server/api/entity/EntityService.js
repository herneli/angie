import { BaseService } from "../../integration/elastic";
import { EntityDao } from "./EntityDao";

export class EntityService extends BaseService{
    constructor() {
        super(EntityDao);
    }

    

    
}
