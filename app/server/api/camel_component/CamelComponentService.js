import { Utils, BaseService } from 'lisco';
import { CamelComponentDao } from './CamelComponentDao';


export class CamelComponentService extends BaseService {

    constructor() {
        super(CamelComponentDao)
    }

}

