import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { IntegrationChannelController } from "../../app/server/api/integration_channel";
import { fakeNext, fakeRequest, fakeResponse } from "./express-test-utils";

const id = "52ccca4d-110a-46d2-929c-a65892b865a8";
const channel_id = "52ccca4d-110a-46d2-929c-a65829b865a8";
const integration = {
    name: "asdf",
    data: {
        channels: [
            {
                id: channel_id,
                nodes: [],
            },
        ],
    },
    enabled: true,
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
describe("IntegrationChannelController", async () => {
    let tracker;

    before(() => {
        tracker = getTracker();
    });

    afterEach(() => {
        tracker.reset();
    });

    it("#configure()", () => {
        let controller = new IntegrationChannelController();

        controller.configure();

        expect(controller).not.to.be.null;
    });

    it("#status()", async () => {
        let controller = new IntegrationChannelController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('from "integration').response([{ id, ...integration }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id, channel: channel_id });

        await controller.channelStatus(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });
   
    it("#log()", async () => {
        let controller = new IntegrationChannelController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select('from "integration').response([{ id, ...integration }]);

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id, channel: channel_id });

        await controller.channelLogs(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#deploy()", async () => {
        let controller = new IntegrationChannelController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...integration }]);
        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...channel }]);
        tracker.on.update("integration").response([{ id, ...integration }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", { id, channel: channel_id });
        try {
            await controller.deployChannel(request, response, fakeNext);
        } catch (ex) {
            expect(ex.message).to.be.eq("no_agent_available");
        }
    });

    it("#undeploy()", async () => {
        let controller = new IntegrationChannelController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...integration }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", { id, channel: channel_id });

        await controller.undeployChannel(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#convertToCamel()", async () => {
        let controller = new IntegrationChannelController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...integration }]);
        tracker.on.select("select count").response([{ total: 1 }]);
        tracker.on.select('select * from "config_model').response([{ id, ...config_model }]);
        tracker.on.select('select * from "test').response([{ id, ...integration }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", null, null, { channel });

        await controller.convertToCamel(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#sendMessageToRoute()", async () => {
        let controller = new IntegrationChannelController();
        controller.configure();
        expect(controller).not.to.be.null;

        tracker.on.select(' from "integration').response([{ id, ...integration }]);
        tracker.on.select("select count").response([{ total: 1 }]);

        const response = new fakeResponse();
        const request = new fakeRequest("POST", { id: channel_id }, null, { endpoint: "", content: "" });

        try {
            await controller.sendMessageToRoute(request, response, fakeNext);
        } catch (ex) {
            expect(ex.message).to.be.eq("Agent not found!");
        }
    });
});
