import { expect } from 'chai';
import { HistoricDataDao } from '../app/server/api/historic';


describe('HistoricDataDao', () => {

    it('#construct()', async () => {
        let elm = new HistoricDataDao();
        expect(elm).not.to.be.null;
    })


    it('#save()', async () => {
        let elm = new HistoricDataDao();

        let result = await elm.save({
            "historic_id": 1,
            "data": "{asdf}"
        });
        expect(result).not.to.be.undefined;
        expect(result[0]).to.be.eq(1);
    })
    it('#loadAllData()', async () => {

        let elm = new HistoricDataDao();

        let result = await elm.loadAllData(0, 1000);

        expect(result).to.be.an('array');
    })
    it('#loadFilteredData()', async () => {

        let elm = new HistoricDataDao();

        let result = await elm.loadFilteredData({
            "historic_id": {
                "type": "exact",
                "value": 1
            }
        }, 0, 1000);

        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(1);
    })

    it('#countFilteredData()', async () => {

        let elm = new HistoricDataDao();

        let result = await elm.countFilteredData({
            "historic_id": {
                "type": "exact",
                "value": 1
            }
        }, 0, 1000);

        expect(result).to.be.eq(1);
    })

    it('#loadById()', async () => {

        let elm = new HistoricDataDao();

        let result = await elm.loadById(1);

        expect(result).to.be.an('array');
        expect(result[0].data).to.be.eq('{asdf}');
    })

    it('#update()', async () => {

        let elm = new HistoricDataDao();

        let result = await elm.update(1, {
            "data": "fdsa"
        });

        expect(result).to.be.eq(1);
    })

    it('#delete()', async () => {

        let elm = new HistoricDataDao();

        let result = await elm.delete(1);

        expect(result).to.be.eq(1);
    })

})