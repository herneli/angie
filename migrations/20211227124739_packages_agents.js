exports.up = async function (knex) {
    if (!(await knex.schema.hasColumn("integration", "package_code"))) {
        await knex.schema.alterTable("integration", function (table) {
            table.string("package_code").notNullable().defaultTo("");
            table.string("package_version").notNullable().defaultTo("");
        });
    }
    if (await knex.schema.hasColumn("integration", "organization_id")) {
        await knex.schema.alterTable("integration", function (table) {
            table.dropForeign("organization_id");
            table.dropColumn("organization_id");
            table.dropColumn("enabled");
        });
    }

    if (!(await knex.schema.hasColumn("script_config", "package_code"))) {
        await knex.schema.alterTable("script_config", function (table) {
            table.string("package_code").notNullable().defaultTo("");
            table.string("package_version").notNullable().defaultTo("");

            table.unique(["package_code", "package_version", "document_type", "code"]);
        });
    }

    if (!(await knex.schema.hasColumn("integration_config", "package_code"))) {
        await knex.schema.alterTable("integration_config", function (table) {
            table.string("package_code").notNullable().defaultTo("");
            table.string("package_version").notNullable().defaultTo("");

            table.unique(["package_code", "package_version", "document_type", "code"]);
        });
    }

    if (!(await knex.schema.hasTable("package"))) {
        await knex.schema.createTable("package", function (table) {
            table.increments();
            table.string("code").notNullable();
            table.string("version").notNullable();
            table.string("name").notNullable();
            table.boolean("modified");
            table.unique(["code", "version"]);
        });
    }

    if (!(await knex.schema.hasTable("integration_deployment"))) {
        await knex.schema.createTable("integration_deployment", function (table) {
            table.uuid("id").primary();
            table.string("last_deployment_date").notNullable();
            table.jsonb("deployment_config");
            table.uuid("organization_id");
            table.foreign("organization_id").references("organization.id");
            table.boolean("enabled").defaultTo(true);
        });
    }

    if (!(await knex.schema.hasTable("jum_agent"))) {
        await knex.schema.createTable("jum_agent", function (table) {
            table.uuid("id").primary();
            table.string("joined_date");
            table.boolean("approved").notNullable();
            table.string("approved_date");
            table.string("name").notNullable();
            table.string("status");
            table.jsonb("meta");
        });
    }

    if (await knex.schema.hasTable("profile")) {
        await knex.schema.dropTable("profile");
    }
    if (!(await knex.schema.hasTable("sections"))) {
        await knex.schema.createTable("sections", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
        });
    }
};

exports.down = async function (knex) {};
