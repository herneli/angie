import { expect } from 'chai';
import { HistoricDataDao } from '../../app/server/api/historic';
import BaseDaoTest from './BaseDaoTest';


describe('HistoricDataDao', () => {


    BaseDaoTest(HistoricDataDao, 1, {
        "historic_id": 1,
        "data": "{asdf}"
    }, {
        "historic_id": {
            "type": "exact",
            "value": 1
        }
    });


})