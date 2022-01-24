exports.up = async function (knex) {
    if (!(await knex.schema.hasTable("organization"))) {
        await knex.schema.createTable("organization", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code");
            table.jsonb("data");
            table.unique(["document_type", "code"]);
        });
    }

    if (!(await knex.schema.hasTable("integration"))) {
        await knex.schema.createTable("integration", function (table) {
            table.uuid("id").primary();
            table.string("name").notNullable();
            table.json("data");
            table.uuid("organization_id");
            table.string("package_code").notNullable();
            table.string("package_version").notNullable();
            table.foreign("organization_id").references("organization.id");
            table.boolean("enabled").defaultTo(true);
        });
    }

    if (!(await knex.schema.hasTable("users"))) {
        await knex.schema.createTable("users", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
        });
    }
    if (!(await knex.schema.hasTable("profile"))) {
        await knex.schema.createTable("profile", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
        });
    }

    if (!(await knex.schema.hasTable("config_model"))) {
        await knex.schema.createTable("config_model", function (table) {
            table.increments();
            table.string("code").notNullable().unique();
            table.string("name").notNullable();
            table.json("data");
        });
    }

    if (!(await knex.schema.hasTable("script_config"))) {
        await knex.schema.createTable("script_config", function (table) {
            table.increments();
            table.string("package_code").notNullable();
            table.string("package_version").notNullable();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
            table.unique(["package_code", "package_version", "document_type", "code"]);
        });
    }

    if (!(await knex.schema.hasTable("integration_config"))) {
        await knex.schema.createTable("integration_config", function (table) {
            table.uuid("id").primary();
            table.string("package_code").notNullable();
            table.string("package_version").notNullable();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
            table.unique(["package_code", "package_version", "document_type", "code"]);
        });
    }

    await knex.from("organization").update({ document_type: "organization" });
    await knex.from("users").update({ document_type: "user" });
    await knex.from("profile").update({ document_type: "profile" });
};

exports.down = async function (knex) {
    if (await knex.schema.hasTable("integration")) {
        await knex.schema.dropTable("integration");
    }
    if (await knex.schema.hasTable("organization")) {
        await knex.schema.dropTable("organization");
    }
    if (await knex.schema.hasTable("integration_channel")) {
        await knex.schema.dropTable("integration_channel");
    }
    if (await knex.schema.hasTable("camel_component")) {
        await knex.schema.dropTable("camel_component");
    }
    if (await knex.schema.hasTable("node_type")) {
        await knex.schema.dropTable("node_type");
    }
    if (await knex.schema.hasTable("users")) {
        await knex.schema.dropTable("users");
    }
    if (await knex.schema.hasTable("profile")) {
        await knex.schema.dropTable("profile");
    }

    if (await knex.schema.hasTable("node_type_subflow")) {
        await knex.schema.dropTable("node_type_subflow");
    }
    if (await knex.schema.hasTable("historic")) {
        await knex.schema.dropTable("historic");
    }
    if (await knex.schema.hasTable("historic_data")) {
        await knex.schema.dropTable("historic_data");
    }
    if (await knex.schema.hasTable("ldap_host")) {
        await knex.schema.dropTable("ldap_host");
    }
    if (await knex.schema.hasTable("config_model")) {
        await knex.schema.dropTable("config_model");
    }

    if (await knex.schema.hasTable("script_config")) {
        await knex.schema.dropTable("script_config");
    }
    if (await knex.schema.hasTable("integration_config")) {
        await knex.schema.dropTable("integration_config");
    }
};
