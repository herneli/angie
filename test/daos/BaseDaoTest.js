import { expect } from 'chai';


/**
 * Funcion para probar los daos genéricos sin tener que replicar el código cada vez
 * 
 * @param {*} name 
 * @param {*} daocls 
 * @param {*} id 
 * @param {*} object 
 * @param {*} filter 
 */
export default function BaseDaoTest(daocls, id, object, filter) {

    it('#construct()', async () => {
        let elm = new daocls();
        expect(elm).not.to.be.null;
    })


    it('#save()', async () => {
        let elm = new daocls();

        let result = await elm.save({
            id: id,
            ...object
        });
        expect(result).not.to.be.undefined;
        expect(result[0]).to.be.eq(1);
    })
    it('#loadAllData()', async () => {

        let elm = new daocls();

        let result = await elm.loadAllData(0, 1000);

        expect(result).to.be.an('array');
    })
    it('#loadFilteredData()', async () => {

        let elm = new daocls();

        let result = await elm.loadFilteredData(filter, 0, 1000);

        expect(result).to.be.an('array');
        expect(result).to.have.lengthOf(1);
    })

    it('#countFilteredData()', async () => {

        let elm = new daocls();

        let result = await elm.countFilteredData(filter, 0, 1000);

        expect(result).to.be.eq(1);
    })

    it('#loadById()', async () => {

        let elm = new daocls();

        let result = await elm.loadById(id);

        expect(result).to.be.an('array');
        expect(result[0].id).to.be.eq(id);
    })

    it('#update()', async () => {

        let elm = new daocls();

        object[Object.keys(object)[0]] = "asdf";
        let result = await elm.update(id, object);

        expect(result).to.be.eq(1);
    })

    it('#delete()', async () => {

        let elm = new daocls();

        let result = await elm.delete(id);

        expect(result).to.be.eq(1);
    })

}