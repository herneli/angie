import { expect } from 'chai';
import { OrganizationDao } from '../../app/server/api/organization';
import BaseDaoTest from './BaseDaoTest';


describe('OrganizationDao', () => {

    BaseDaoTest(OrganizationDao, 1, {
        "name": "asdf",
        "description": "asdf"
    }, {
        "name": {
            "type": "exact",
            "value": "asdf"
        }
    });


})