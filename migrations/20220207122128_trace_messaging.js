exports.up = async (knex) => {
    if (!(await knex.schema.hasTable("zmessages"))) {
        await knex.schema.createTable("zmessages", function (table) {
            table.string("message_id", 50).primary();
            table.string("status", 20).notNullable();
            table.string("date_reception", 30).notNullable();
            table.string("date_processed", 30);
            table.string("channel_id", 50);
            table.string("channel_name", 100);
            table.string("message_content_id", 50);
            table.string("message_content_type", 50);
            table.string("error_cause", 200);
            table.text("error_stack", "longtext");
            table.jsonb("meta");
        });
    }

    if (!(await knex.schema.hasTable("zentity"))) {
        await knex.schema.createTable("zentity", function (table) {
            table.string("id", 100).primary();
            table.jsonb("data");
        });
    }

    if (!(await knex.schema.hasTable("zstats"))) {
        await knex.schema.createTable("zstats", function (table) {
            table.increments();
            table.string("event", 30).notNullable();
            table.string("breadcrumb_id", 50).notNullable();
            table.string("exchange_id", 50).notNullable();
            table.string("current_channel", 50);
            table.string("current_channel_name", 100);
            table.string("group", 100);
            table.string("current_route", 50).notNullable();
            table.string("date_time", 30);
            table.string("arrow", 4).notNullable();
            table.jsonb("data");
        });
    }

    if (!(await knex.schema.hasTable("ztags"))) {
        await knex.schema.createTable("ztags", function (table) {
            table.string("tag", 200).notNullable();
            table.string("message_id", 50).notNullable();
            table.string("route_id", 50).notNullable();
            table.string("channel_id", 50).notNullable();
            table.string("date_reception", 30).notNullable();
            table.primary(["tag", "message_id", "route_id"]);
        });
    }
};

exports.down = function (knex) {};