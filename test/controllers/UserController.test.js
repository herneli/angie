import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { UserController } from "../../app/server/api/user";
import { fakeNext, fakeRequest, fakeResponse } from "./express-test-utils";

let id = "52ccca4d-110a-46d2-929c-a65892b865a8";
let object = {
    data: {},
    document_type: "user",
    code: "asdf",
};
let filter = {
    code: {
        type: "exact",
        value: "asdf",
    },
};

describe("UserController", async () => {
    let tracker;

    before(() => {
        tracker = getTracker();
    });

    afterEach(() => {
        tracker.reset();
    });

    it("#configure()", () => {
        let controller = new UserController();

        controller.configure();

        expect(controller).not.to.be.null;
    });

    it("#list()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('select * from "users').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", null, filter);

        await controller.listEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#get()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "users').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id });

        await controller.getEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#save()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.insert("users").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", null, null, { id, ...object });

        await controller.saveEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#update()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.update("users").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("PUT", { id }, null, { id, ...object });

        await controller.updateEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#delete()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "users"').response([{ id, ...object }]);
        tracker.on.delete("users").response(1);

        const response = new fakeResponse();
        const request = new fakeRequest("DELETE", { id });

        await controller.deleteEntidad(request, response, fakeNext);

        let {data} = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    //TODO import!

    it("#saveOnKeycloak()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;


        const data = await controller.saveUsers(null, object);

        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

    });

    it("#updateOnKeycloak()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;


        const data = await controller.updateUser(null, object, id);

        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

    });

    it("#deleteOnKeycloak()", async () => {
        let controller = new UserController();
        controller.configure();
        expect(controller).not.to.be.null;


        const data = await controller.deleteUser(id);

        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

    });
});
