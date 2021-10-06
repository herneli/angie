import { expect } from 'chai';
import { IntegrationRouteDao } from '../../app/server/api/integration_route';
import BaseDaoTest from './BaseDaoTest';


describe('IntegrationRouteDao', () => {

    BaseDaoTest(IntegrationRouteDao, "52ccca4d-110a-46d2-929c-a65892b865a8", {
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