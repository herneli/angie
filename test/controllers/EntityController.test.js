import { expect } from "chai";
import { EntityController } from "../../app/server/api/entity/EntityController";
import { fakeNext, fakeRequest, fakeResponse } from "./express-test-utils";

describe("EntityController", async () => {
    it("#configure()", () => {
        let controller = new EntityController();

        controller.configure();

        expect(controller).not.to.be.null;
    });

    it("#list()", async () => {
        let controller = new EntityController();
        controller.configure();
        expect(controller).not.to.be.null;

        const response = new fakeResponse();
        const request = new fakeRequest("POST", null, null, {
            "": {
                type: "query_string",
                value: "_index:entity_order",
            },
        });

        await controller.listEntity(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });

    it("#get()", async () => {
        let controller = new EntityController();
        controller.configure();
        expect(controller).not.to.be.null;

        const response = new fakeResponse();
        const request = new fakeRequest("GET", { id: "7778" });

        await controller.getEntity(request, response, fakeNext);

        let { data } = response;
        expect(data).not.to.be.undefined;
        expect(data).to.be.an("object");

        expect(data.success).to.be.true;
    });
});
