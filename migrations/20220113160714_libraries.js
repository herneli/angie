exports.up = async function(knex) {
    const { v4 } = require("uuid");

    if (!(await knex.schema.hasTable("library"))) {
        await knex.schema.createTable("library", function (table) {
            table.uuid("id").primary();
            table.string("group_id").notNullable();
            table.string("artifact_id").notNullable();
            table.string("version");
            table.unique(["group_id", "artifact_id", "version"]);
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-http",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-jetty",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-netty",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-mllp",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-hl7",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-mvel",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-groovy",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-management",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "org.apache.camel",
            artifact_id: "camel-rabbitmq",
            version: null
        });
        await knex.from("library").insert({
            id: v4(),
            group_id: "ca.uhn.hapi",
            artifact_id: "hapi-structures-v25",
            version: "2.2"
        });
   
    }
};

exports.down = async function(knex) {
    if (await knex.schema.hasTable("library")) {
        await knex.schema.dropTable("library");
    }
};
