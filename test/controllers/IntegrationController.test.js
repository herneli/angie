import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { IntegrationController } from "../../app/server/api/integration/IntegrationController";
import { fakeNext, fakeRequest, fakeResponse } from "./express-test-utils";

const id = "52ccca4d-110a-46d2-929c-a65892b865a8";
const channel_id = "52ccca4d-110a-46d2-929c-a65829b865a8";
const object = {
    name: "asdf",
    data: {
        channels: [
            {
                id: "3",
                nodes: [],
            },
        ],
    },
    enabled: true,
};
const filter = {
    name: {
        type: "exact",
        value: "asdf",
    },
};
const channel = {
    id: channel_id,
    nodes: [],
};
const config_model = {
    data: {
        table: "test",
        documentType: "test",
    },
    name: "test",
    code: "asdf",
};
describe("IntegrationController", async () => {
    let tracker;

    before(() => {
        tracker = getTracker();
    });

    afterEach(() => {
        tracker.reset();
    });

    it("#configure()", () => {
        let controller = new IntegrationController();

        controller.configure();

        expect(controller).not.to.be.null;
    });

    it("#list()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('from "integration').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", null, filter);

        await controller.listEntidad(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#get()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id });

        await controller.getEntidad(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#save()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.insert("integration").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", null, null, { id, ...object });

        await controller.saveEntidad(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#update()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.update("integration").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("PUT", { id }, null, { id, ...object });

        await controller.updateEntidad(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#delete()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('select * from "integration"').response([{ id, ...object }]);
        tracker.on.delete("integration").response(1);

        const response = new fakeResponse();
        const request = new fakeRequest("DELETE", { id });

        await controller.deleteEntidad(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#deploy()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...channel }]);
        tracker.on.select(' from "integration').response([{ id, ...object }]);
        tracker.on.update("integration").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", { id });
        await controller.deployIntegration(request, response, (ex) => {
            expect(ex.message).to.be.eq("no_agent_available");
        });

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#undeploy()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...object }]);
        tracker.on.update("integration").response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", { id });

        try {
            await controller.undeployIntegration(request, response, fakeNext);
        } catch (ex) {
            expect(ex.message).to.be.eq("channel_not_running");
        }
    });

    it("#statuses()", async () => {
        let controller = new IntegrationController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...object }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id });

        await controller.integrationChannelStatuses(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });
});
