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
            table.text("error_cause", "longtext");
            table.text("error_stack", "longtext");
            table.jsonb("meta");

            table.index(["status"]);
            table.index(["message_id"]);
            table.index(["date_reception"]);
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

            table.index(["date_time"]);
            table.index(["event"]);
            table.index(["breadcrumb_id"]);
            table.index(["exchange_id"]);
        });
    }

    if (!(await knex.schema.hasTable("ztags"))) {
        await knex.schema.createTable("ztags", function (table) {
            table.string("tag", 200).notNullable();
            table.string("tag_message_id", 50).notNullable();
            table.string("tag_route_id", 50).notNullable();
            table.string("tag_channel_id", 50).notNullable();
            table.string("tag_date", 30).notNullable();
            table.primary(["tag", "tag_message_id", "tag_route_id"]);

            table.index(["tag"]);
            table.index(["tag_message_id"]);
            table.index(["tag_date"]);
        });
    }

    await knex.raw(`CREATE MATERIALIZED VIEW IF NOT EXISTS tagged_messages AS select "message_id","date_reception", "date_processed", "channel_name", "message_content_id", "message_content_type", "status", "meta", string_agg("ztags"."tag", '-' order by "ztags"."tag_date") as datatags
    from "zmessages" 
    left join "ztags" on "zmessages"."message_id" = "ztags"."tag_message_id" 
    group by "zmessages"."message_id";`);
};

exports.down = async (knex) => {
    await knex.raw(`DROP MATERIALIZED VIEW tagged_messages;`);
};
