import { expect } from 'chai';
import { NodeTypeDao } from '../../app/server/api/node_type';
import BaseDaoTest from './BaseDaoTest';


describe('NodeTypeDao', () => {
    
    BaseDaoTest(NodeTypeDao, "52ccca4d-110a-46d2-929c-a65892b865a8", {
        "name": "asdf"
    }, {
        "name": {
            "type": "exact",
            "value": "asdf"
        }
    });
})