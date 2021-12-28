import { expect } from "chai";
import { getTracker } from "knex-mock-client";
import { IntegrationDao } from "../../app/server/api/integration";

let id = "52ccca4d-110a-46d2-929c-a65892b865a8";
let object = {
    name: "asdf",
    data: {},
    enabled: true,
};
let filter = {
    name: {
        type: "exact",
        value: "asdf",
    },
};
describe("IntegrationDao", () => {
    let tracker;

    before(() => {
        tracker = getTracker();
    });

    afterEach(() => {
        tracker.reset();
    });

    it("#save()", async () => {
        const elm = new IntegrationDao();

        tracker.on.insert("integration").response([{ id: id, ...object }]);

        let result = await elm.save({
            id: id,
            ...object,
        });
        expect(result).not.to.be.undefined;
        expect(result[0]).to.have.property("id");
        expect(result[0].id).to.be.equal(id);
    });

    it("#loadAllData()", async () => {
        const elm = new IntegrationDao();
        tracker.on
            .select('from "integration"')
            .response([{ id: id, ...object }]);

        let result = await elm.loadAllData(0, 1000);

        expect(result).to.be.an("array");
        expect(result).to.have.lengthOf(1);
    });

    it("#loadFilteredData()", async () => {
        const elm = new IntegrationDao();
        tracker.on
            .select('where ("name" ')
            .response([{ id: id, ...object }]);

        let result = await elm.loadFilteredData(filter, 0, 1000);

        expect(result).to.be.an("array");
        expect(result).to.have.lengthOf(1);
    });

    it("#countFilteredData()", async () => {
        const elm = new IntegrationDao();
        tracker.on.select("select count").response([{ total: 1 }]);

        let result = await elm.countFilteredData(filter, 0, 1000);

        expect(result).to.be.eq(1);
    });

    it("#loadById()", async () => {
        let elm = new IntegrationDao();
        tracker.on
            .select('select * from "integration"')
            .response([{ id: id, ...object }]);

        let result = await elm.loadById(id);

        expect(result).to.be.an("object");
        expect(result.id).to.be.eq(id);
    });

    it("#update()", async () => {
        let elm = new IntegrationDao();

        object.name = "asdf2"
        tracker.on.update("integration").response([{ id: id, ...object }]);

        let result = await elm.update(id, object);

        expect(result).not.to.be.undefined;
        expect(result[0]).to.have.property("name");
        expect(result[0].name).to.be.equal("asdf2");
    });

    it("#delete()", async () => {
        let elm = new IntegrationDao();

        tracker.on
            .select('select * from "integration"')
            .response([{ id: id, ...object }]);
        tracker.on.delete("integration").response(1);

        let result = await elm.delete(id);

        expect(result).to.be.eq(1);
    });

    it("#deleteNotFoud()", async () => {
        let elm = new IntegrationDao();

        const id = "52ccca4d-110a-46d2-929c-a65892b865a8";
        tracker.on.select('select * from "integration"').response([]);
        tracker.on.delete("integration").response(1);
        try {
            await elm.delete(id);
        } catch (err) {
            expect(err).to.be.eq("NotFound");
        }
    });
});
