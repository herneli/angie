exports.up = async function (knex) {
    if (!(await knex.schema.hasTable("certificate"))) {
        await knex.schema.createTable("certificate", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code");
            table.jsonb("data");
            table.unique(["document_type", "code"]);
        });
    }

    if (!(await knex.schema.hasTable("jum_agent_certificate"))) {
        await knex.schema.createTable("jum_agent_certificate", function (table) {
            table.uuid("jum_agent_id");
            table.uuid("certificate_id");
            table.foreign("jum_agent_id").references("jum_agent.id");
            table.foreign("certificate_id").references("certificate.id");
            table.unique(["jum_agent_id", "certificate_id"]);
        });
    }

};

exports.down = async function (knex) {
    if (await knex.schema.hasTable("certificate")) {
        await knex.schema.dropTable("certificate");
    }    
    if (await knex.schema.hasTable("jum_agent_certificate")) {
        await knex.schema.dropTable("jum_agent_certificate");
    }
};
