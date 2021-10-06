import { expect } from 'chai';
import { CamelComponentDao } from '../../app/server/api/camel_component';

import BaseDaoTest from './BaseDaoTest';

describe('CamelComponentDao', () => {


    BaseDaoTest(CamelComponentDao, "52ccca4d-110a-46d2-929c-a65892b865a8", {
        "name": "asdf"
    }, {
        "name": {
            "type": "exact",
            "value": "asdf"
        }
    });

})