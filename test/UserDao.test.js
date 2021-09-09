import { expect } from 'chai';
import { UserDao } from '../app/server/api/user';


describe('UserDao', () => {

    it('#construct()', async () => {
        let elm = new UserDao();
        expect(elm).not.to.be.null;
    })


    it('#save()', async () => {
        let elm = new UserDao();

        let result = await elm.save({
            "username": "asdf",
            "password": "asdf"
        });
        expect(result).not.to.be.undefined;
        expect(result[0]).to.be.eq(1);
    })
    it('#loadAllData()', async () => {

        let elm = new UserDao();

        let result = await elm.loadAllData(0, 1000);

        expect(result).to.be.an('array');
    })
    it('#loadFilteredData()', async () => {

        let elm = new UserDao();

        let result = await elm.loadFilteredData({
            "username": {
                "type": "exact",
                "value": "asdf"
            }
        }, 0, 1000);

        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(1);
    })

    it('#countFilteredData()', async () => {

        let elm = new UserDao();

        let result = await elm.countFilteredData({
            "username": {
                "type": "exact",
                "value": "asdf"
            }
        }, 0, 1000);

        expect(result).to.be.eq(1);
    })

    it('#loadById()', async () => {

        let elm = new UserDao();

        let result = await elm.loadById(1);

        expect(result).to.be.an('array');
        expect(result[0].username).to.be.eq('asdf');
    })

    it('#update()', async () => {

        let elm = new UserDao();

        let result = await elm.update(1, {
            "password": "fdsa"
        });

        expect(result).to.be.eq(1);
    })

    it('#delete()', async () => {

        let elm = new UserDao();

        let result = await elm.delete(1);

        expect(result).to.be.eq(1);
    })

})