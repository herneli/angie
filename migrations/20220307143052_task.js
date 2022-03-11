exports.up = async function (knex) {
    if (!(await knex.schema.hasTable("task"))) {
        await knex.schema.createTable("task", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code");
            table.jsonb("data");
            table.unique(["document_type", "code"]);
        });
    }
    if (!(await knex.schema.hasTable("task_log"))) {
        await knex.schema.createTable("task_log", function (table) {
            table.uuid("id").primary();
            table.string("task_code").notNullable();
            table.string("start_datetime", 40).notNullable();
            table.string("end_datetime", 40);
            table.boolean("error");
        });
    }
};

exports.down = async function (knex) {
    if (await knex.schema.hasTable("task")) {
        await knex.schema.dropTable("task");
    }
    if (await knex.schema.hasTable("task_log")) {
        await knex.schema.dropTable("task_log");
    }
};
