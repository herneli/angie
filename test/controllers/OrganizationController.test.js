import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { OrganizationController } from "../../app/server/api/organization";
import { fakeNext, fakeRequest, fakeResponse } from "./express-test-utils";

let id = "52ccca4d-110a-46d2-929c-a65892b865a8";
let object = {
    data: {},
    document_type: "organization",
    code: "asdf",
};
let filter = {
    code: {
        type: "exact",
        value: "asdf",
    },
};

describe("OrganizationController", async () => {
    let tracker;

    before(() => {
        tracker = getTracker();
    });

    afterEach(() => {
        tracker.reset();
    });

    it("#configure()", () => {
        let controller = new OrganizationController();

        controller.configure();

        expect(controller).not.to.be.null;
    });

    it("#list()", async () => {
        let controller = new OrganizationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('select * from "organization').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", null, filter);

        await controller.listEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#get()", async () => {
        let controller = new OrganizationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "organization').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id });

        await controller.getEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#save()", async () => {
        let controller = new OrganizationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.insert("organization").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", null, null, { id, ...object });

        await controller.saveEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#update()", async () => {
        let controller = new OrganizationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.update("organization").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("PUT", { id }, null, { id, ...object });

        await controller.updateEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#delete()", async () => {
        let controller = new OrganizationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "organization"').response([{ id, ...object }]);
        tracker.on.delete("organization").response(1);

        const response = new fakeResponse();
        const request = new fakeRequest("DELETE", { id });

        await controller.deleteEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });
});
