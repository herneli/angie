exports.up = async (knex) => {
    if (await knex.schema.hasTable("integration")) {
        await knex.schema.alterTable("integration", function (table) {
            table.jsonb("data").alter();
        });
    }
};

exports.down = async (knex) => {};
