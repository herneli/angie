import { expect } from 'chai';
import { LdapHostDao } from '../app/server/api/ldaphost';


describe('LdapHostDao', () => {

    it('#construct()', async () => {
        let elm = new LdapHostDao();
        expect(elm).not.to.be.null;
    })


    it('#save()', async () => {
        let elm = new LdapHostDao();

        let result = await elm.save({
            "name": "asdf",
            "active": 1,
            "url": "",
            "query_base": "",
            "query_user": "",
            "query_password": "",
            "query": ""
        });

        expect(result).not.to.be.undefined;
        expect(result[0]).to.be.eq(1);
    })
    it('#loadAllData()', async () => {

        let elm = new LdapHostDao();

        let result = await elm.loadAllData(0, 1000);

        expect(result).to.be.an('array');
    })
    it('#loadFilteredData()', async () => {

        let elm = new LdapHostDao();

        let result = await elm.loadFilteredData({
            "name": {
                "type": "exact",
                "value": "asdf"
            }
        }, 0, 1000);

        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(1);
    })

    it('#countFilteredData()', async () => {

        let elm = new LdapHostDao();

        let result = await elm.countFilteredData({
            "name": {
                "type": "exact",
                "value": "asdf"
            }
        }, 0, 1000);

        expect(result).to.be.eq(1);
    })

    it('#loadById()', async () => {

        let elm = new LdapHostDao();

        let result = await elm.loadById(1);

        expect(result).to.be.an('array');
        expect(result[0].active).to.be.eq(1);
    })

    it('#update()', async () => {

        let elm = new LdapHostDao();

        let result = await elm.update(1, {
            "query_user": "fdsa"
        });

        expect(result).to.be.eq(1);
    })

    it('#delete()', async () => {

        let elm = new LdapHostDao();

        let result = await elm.delete(1);

        expect(result).to.be.eq(1);
    })

})