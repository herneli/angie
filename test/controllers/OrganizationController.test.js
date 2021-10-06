import { expect } from 'chai';
import { OrganizationController } from '../../app/server/api/organization';


describe('OrganizationController', async () => {
    it('#configure()', () => {
        let controller = new OrganizationController();

        controller.configure();

        expect(controller).not.to.be.null;
    })

    it('#save()', async () => {

        let controller = new OrganizationController();
        controller.configure();
        expect(controller).not.to.be.null;

        let data = null;

        const fakeResponse = {
            json: (jsondata) => {
                data = jsondata
            }
        };
        const fakeRequest = {
            headers: { authorization: "" },
            url: 'http://asdfasd/test',
            body: {
                "name": "asdf",
                "description": "asdf"
            }
        }


        await controller.saveEntidad(fakeRequest, fakeResponse, (e) => {
            if (e) console.error(e)
        })

        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    })



})