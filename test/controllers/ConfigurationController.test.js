import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { ConfigurationController } from "../../app/server/api/configuration/ConfigurationController";
import { fakeNext, fakeRequest, fakeResponse } from "./express-test-utils";

const code = "config_test";
const id = "52ccca4d-110a-46d2-929c-a65892b865a8";
const config_model = {
    data: {
        table: "test",
        documentType: "test",
    },
    name: "test",
    code: "asdf",
};
const object = {
    data: {},
    document_type: "test",
    code: "asdf",
};
const filter = {
    code: {
        type: "exact",
        value: "asdf",
    },
};

describe("ConfigurationController", async () => {
    let tracker;

    before(() => {
        tracker = getTracker();
    });

    afterEach(() => {
        tracker.reset();
    });

    it("#configure()", () => {
        let controller = new ConfigurationController();

        controller.configure();

        expect(controller).not.to.be.null;
    });

    it("#getModel()", async () => {
        let controller = new ConfigurationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { code }, filter);

        await controller.getModel(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#getModelDataList()", async () => {
        let controller = new ConfigurationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id, code });

        await controller.getModelDataList(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#getModelData()", async () => {
        let controller = new ConfigurationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id, code });

        await controller.getModelData(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#postModel()", async () => {
        let controller = new ConfigurationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.insert("test").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", { code }, null, { id, ...object });

        await controller.postModel(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#putModel()", async () => {
        let controller = new ConfigurationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...object }]);
        tracker.on.update("test").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("PUT", { id, code }, null, { id, ...object });

        await controller.putModel(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#deleteModelData()", async () => {
        let controller = new ConfigurationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...object }]);
        tracker.on.delete("test").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("DELETE", { id, code });

        await controller.deleteModelData(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });
});
