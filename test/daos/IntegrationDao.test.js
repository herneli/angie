import { expect } from 'chai';
import { IntegrationDao } from '../../app/server/api/integration';
import BaseDaoTest from './BaseDaoTest';


describe('IntegrationDao', () => {


    BaseDaoTest(IntegrationDao, "52ccca4d-110a-46d2-929c-a65892b865a8", {
        "created_on": "2021-10-05T00:00:00.000Z",
        "last_updated": "2021-10-05T00:00:00.000Z",
        "name": "asdf",
        "description": "asdf"
    }, {
        "name": {
            "type": "exact",
            "value": "asdf"
        }
    });


})