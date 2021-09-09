import { expect } from 'chai';
import { HistoricDao } from '../app/server/api/historic';


describe('HistoricDao', () => {

    it('#construct()', async () => {
        let elm = new HistoricDao();
        expect(elm).not.to.be.null;
    })


    it('#save()', async () => {
        let elm = new HistoricDao();

        let result = await elm.save({
            "date": "asdf",
            "method": "asdf"
        });
        expect(result).not.to.be.undefined;
        expect(result[0]).to.be.eq(1);
    })
    it('#loadAllData()', async () => {

        let elm = new HistoricDao();

        let result = await elm.loadAllData(0, 1000);

        expect(result).to.be.an('array');
    })
    it('#loadFilteredData()', async () => {

        let elm = new HistoricDao();

        let result = await elm.loadFilteredData({
            "date": {
                "type": "exact",
                "value": "asdf"
            }
        }, 0, 1000);

        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(1);
    })

    it('#countFilteredData()', async () => {

        let elm = new HistoricDao();

        let result = await elm.countFilteredData({
            "date": {
                "type": "exact",
                "value": "asdf"
            }
        }, 0, 1000);

        expect(result).to.be.eq(1);
    })

    it('#loadById()', async () => {

        let elm = new HistoricDao();

        let result = await elm.loadById(1);

        expect(result).to.be.an('array');
        expect(result[0].date).to.be.eq('asdf');
    })

    it('#update()', async () => {

        let elm = new HistoricDao();

        let result = await elm.update(1, {
            "method": "fdsa"
        });

        expect(result).to.be.eq(1);
    })

    it('#delete()', async () => {

        let elm = new HistoricDao();

        let result = await elm.delete(1);

        expect(result).to.be.eq(1);
    })

})