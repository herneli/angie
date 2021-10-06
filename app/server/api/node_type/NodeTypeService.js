import { Utils, BaseService } from 'lisco';
import { NodeTypeDao } from './NodeTypeDao';


export class NodeTypeService extends BaseService {

    constructor() {
        super(NodeTypeDao)
    }

}

