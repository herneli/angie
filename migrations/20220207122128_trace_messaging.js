exports.up = async (knex) => {
    if (!(await knex.schema.hasTable("zmessages"))) {
        await knex.schema.createTable("zmessages", function (table) {
            table.string("message_id", 50).primary();
            table.string("status", 20).notNullable();
            table.datetime("date_reception", { precision: 6 }).notNullable();
            table.datetime("date_processed", { precision: 6 });
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
            table.string("group_tag", 100);
            table.string("current_route", 50).notNullable();
            table.datetime("date_time", { precision: 6 });
            table.string("arrow", 4).notNullable();
            table.jsonb("data");

            table.index(["date_time"]);
            table.index(["breadcrumb_id"]);
            table.index(["exchange_id"]);
        });
    }

    if (!(await knex.schema.hasTable("zcheckpoints"))) {
        await knex.schema.createTable("zcheckpoints", function (table) {
            table.string("check_tag", 200).notNullable();
            table.string("check_message_id", 50).notNullable();
            table.string("check_route_id", 50).notNullable();
            table.string("check_channel_id", 50).notNullable();
            table.datetime("check_date", { precision: 6 }).notNullable();
            table.primary(["check_tag", "check_message_id", "check_route_id"]);

            table.index(["check_tag"]);
            table.index(["check_message_id"]);
            table.index(["check_date"]);
        });
    }



    if ((await knex.schema.hasTable("zmessages"))) {
        await knex.schema.alterTable("zmessages", function (table) {
            table.datetime("date_reception", { precision: 6 }).notNullable().alter();
            table.datetime("date_processed", { precision: 6 }).alter();
        });
    }
    if ((await knex.schema.hasTable("zcheckpoints"))) {
        await knex.schema.alterTable("zcheckpoints", function (table) {
            table.datetime("check_date", { precision: 6 }).notNullable().alter();
        });
    }
    if ((await knex.schema.hasTable("zstats"))) {
        await knex.schema.alterTable("zstats", function (table) {
            table.datetime("date_time", { precision: 6 }).alter();
        });
    }


    
    await knex("integration_config").update({ document_type: "checkpoint" }).where({ document_type: "tag" });

    await knex.raw(`CREATE MATERIALIZED VIEW IF NOT EXISTS tagged_messages AS select "message_id","date_reception", "date_processed", "channel_name", "channel_id", "message_content_id", "message_content_type", "status", "meta", string_agg("zcheckpoints"."check_tag", '-' order by "zcheckpoints"."check_date") as checks
    from "zmessages" 
    left join "zcheckpoints" on "zmessages"."message_id" = "zcheckpoints"."check_message_id" 
    group by "zmessages"."message_id";`);

};

exports.down = async (knex) => {
    await knex.raw(`DROP MATERIALIZED VIEW IF EXISTS tagged_messages;`);
};
