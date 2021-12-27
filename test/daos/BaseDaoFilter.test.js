import { expect } from "chai";
import { BaseDao } from "../../app/server/integration/elastic/index.js";

describe("parseFiltersObject (BaseDao)", () => {
    const elm = new BaseDao();
    it("Basic filter", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: "value",
            },
            10,
            1
        );

        expect(result.query).to.have.property("bool");
        expect(result.query.bool).to.have.property("filter");
        expect(result.query.bool.filter).to.have.property("term");
    });

    it("Exact filter", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "exact", value: "value" },
            },
            10,
            1
        );

        expect(result.query).to.have.property("bool");
        expect(result.query.bool).to.have.property("filter");
        expect(result.query.bool.filter).to.have.property("term");
        expect(result.query.bool.filter.term).to.have.property("field");
        expect(result.query.bool.filter.term.field).to.be.equal("value");
    });

    it("Between (start)", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "between", start: 5 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.not.have.property("lte");
        expect(result.query.range.field).to.have.property("gte");
        expect(result.query.range.field.gte).to.be.equal(5);
    });

    it("Between (end)", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "between", end: 12 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.not.have.property("gte");
        expect(result.query.range.field).to.have.property("lte");
        expect(result.query.range.field.lte).to.be.equal(12);
    });

    it("Between", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "between", start: 5, end: 12 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.have.property("gte");
        expect(result.query.range.field).to.have.property("lte");
        expect(result.query.range.field.gte).to.be.equal(5);
        expect(result.query.range.field.lte).to.be.equal(12);
    });

    it("Greater than", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "greater", value: 5 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.have.property("gt");
        expect(result.query.range.field.gt).to.be.equal(5);
    });

    it("Greater Equal", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "greaterEq", value: 5 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.have.property("gte");
        expect(result.query.range.field.gte).to.be.equal(5);
    });

    it("Less than", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "less", value: 5 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.have.property("lt");
        expect(result.query.range.field.lt).to.be.equal(5);
    });

    it("Less Equal", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "lessEq", value: 5 },
            },
            10,
            1
        );

        expect(result.query).to.have.property("range");
        expect(result.query.range).to.have.property("field");
        expect(result.query.range.field).to.have.property("lte");
        expect(result.query.range.field.lte).to.be.equal(5);
    });

    it("Exists", async () => {
        const result = await elm.parseFiltersObject({ field: { type: "exists", value: "Test" } }, 10, 1);

        expect(result.query).to.have.property("exists");
        expect(result.query.exists).to.have.property("field");
        expect(result.query.exists.field).to.be.equal("Test");
    });

    it("Not exists", async () => {
        const result = await elm.parseFiltersObject({ field: { type: "notExists", value: "Test" } }, 10, 1);

        expect(result.query).to.have.property("bool");
        expect(result.query.bool).to.have.property("must_not");
        expect(result.query.bool.must_not).to.be.an("array");
        expect(result.query.bool.must_not[0]).to.have.property("exists");
        expect(result.query.bool.must_not[0].exists).to.have.property("field");
        expect(result.query.bool.must_not[0].exists.field).to.be.equal("Test");
    });

    it("Terms | IN", async () => {
        const values = ["A", "B", "C"];
        const result = await elm.parseFiltersObject(
            {
                field: { type: "in", value: values },
            },
            10,
            1
        );

        expect(result.query).to.have.property("bool");
        expect(result.query.bool).to.have.property("filter");
        expect(result.query.bool.filter).to.have.property("terms");
        expect(result.query.bool.filter.terms).to.have.property("field");
        expect(result.query.bool.filter.terms.field).to.be.an("array");
        expect(result.query.bool.filter.terms.field).deep.to.equal(["a", "b", "c"]);
    });

    it("TermsI", async () => {
        const values = ["A", "B", "C"];
        const result = await elm.parseFiltersObject(
            {
                field: { type: "termsi", value: values },
            },
            10,
            1
        );

        expect(result.query).to.have.property("bool");
        expect(result.query.bool).to.have.property("filter");
        expect(result.query.bool.filter).to.have.property("terms");
        expect(result.query.bool.filter.terms).to.have.property("field");
        expect(result.query.bool.filter.terms.field).to.be.an("array");
        expect(result.query.bool.filter.terms.field).deep.to.equal(values);
    });

    it("Not", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "not", value: "value" },
            },
            10,
            1
        );

        expect(result.query).to.have.property("bool");
        expect(result.query.bool).to.have.property("filter");
        expect(result.query.bool.filter).to.have.property("bool");
        expect(result.query.bool.filter.bool).to.have.property("must_not");
        expect(result.query.bool.filter.bool.must_not).to.be.an("array");
        expect(result.query.bool.filter.bool.must_not[0]).to.have.property("term");
        expect(result.query.bool.filter.bool.must_not[0].term).to.have.property("field");
        expect(result.query.bool.filter.bool.must_not[0].term.field).to.be.equal("value");
    });

    it("Wildcard | Like", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "wildcard", value: "A" },
            },
            10,
            1
        );

        expect(result.query).to.have.property("wildcard");
        expect(result.query.wildcard).to.have.property("field");
        expect(result.query.wildcard.field).to.be.equal("*a*");
    });

    it("LikeI", async () => {
        const result = await elm.parseFiltersObject(
            {
                field: { type: "likeI", value: "A" },
            },
            10,
            1
        );

        expect(result.query).to.have.property("wildcard");
        expect(result.query.wildcard).to.have.property("field");
        expect(result.query.wildcard.field).to.be.equal("*A*");
    });
});
