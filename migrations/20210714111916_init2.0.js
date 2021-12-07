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
            table.foreign("organization_id").references("organization.id");
            table.boolean("enabled").defaultTo(true);
        });
    }

    if (!(await knex.schema.hasTable("camel_component"))) {
        await knex.schema.createTable("camel_component", function (table) {
            table.uuid("id").primary();
            table.string("name").notNullable();
            table.text("xml_template");
            table.json("options");
        });
    }
    if (!(await knex.schema.hasTable("node_type"))) {
        await knex.schema.createTable("node_type", function (table) {
            table.uuid("id").primary();
            table.string("name").notNullable();
            table.string("description");
            table.string("node_type", 30);
            table.string("react_component_type", 30);
            table.uuid("camel_component_id");
            table.uuid("plugin_id");
            table.string("handles");
            table.string("form_type", 30);
            table.uuid("form_type_plugin_id");
            table.json("json_data_schema");
            table.json("json_ui_schema");
            table.json("defaults");
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
    if (!(await knex.schema.hasTable("node_type_subflow"))) {
        await knex.schema.createTable("node_type_subflow", function (table) {
            table.uuid("id").primary();
            table.string("custom_name").notNullable();
            table.uuid("type_id").notNullable();
            table.json("nodes");
        });
    }

    if (!(await knex.schema.hasTable("historic"))) {
        await knex.schema.createTable("historic", function (table) {
            table.increments();
            table.string("date", 30).notNullable();
            table.integer("user_id");
            table.string("action_url");
            table.string("method");
            table.integer("time_spent");
        });
    }
    if (!(await knex.schema.hasTable("historic_data"))) {
        await knex.schema.createTable("historic_data", function (table) {
            table.increments();
            table.integer("historic_id").notNullable();
            table.json("data");
            table.json("client_data");
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
            table.string("package_name").notNullable();
            table.string("package_version").notNullable();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
            table.unique(["package_name", "package_version", "document_type", "code"]);
        });
    }

    if (!(await knex.schema.hasTable("integration_config"))) {
        await knex.schema.createTable("integration_config", function (table) {
            table.uuid("id").primary();
            table.string("document_type").notNullable();
            table.string("code").notNullable();
            table.jsonb("data");
            table.unique(["document_type", "code"]);
        });
    }
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
