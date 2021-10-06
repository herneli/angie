import { expect } from 'chai';
import { HistoricDao } from '../../app/server/api/historic';
import BaseDaoTest from './BaseDaoTest';


describe('HistoricDao', () => {

    BaseDaoTest(HistoricDao, 1, {
        "date": "asdf",
        "method": "asdf"
    }, {
        "date": {
            "type": "exact",
            "value": "asdf"
        }
    });

})