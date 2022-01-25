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
            table.string("name").notNullable();
            table.string("remote");
            table.unique(["code"]);
        });
    }

    if (!(await knex.schema.hasTable("package_version"))) {
        await knex.schema.createTable("package_version", function (table) {
            table.increments();
            table.string("code").notNullable();
            table.string("version").notNullable();
            table.string("remote_commit");
            table.string("local_commit");
            table.jsonb("dependencies");
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
    if ((await knex.schema.hasTable("integration_deployment"))) {
        if (!(await knex.schema.hasColumn("integration_deployment", "channel_config"))) {
            await knex.schema.alterTable("integration_deployment", function (table) {
                table.jsonb("channel_config");
            });
        }
    }

    if (!(await knex.schema.hasTable("jum_agent"))) {
        await knex.schema.createTable("jum_agent", function (table) {
            table.uuid("id").primary();
            table.string("joined_date", 40);
            table.boolean("approved").notNullable();
            table.string("approved_date", 40);
            table.string("name").notNullable();
            table.string("status");
            table.jsonb("meta");
        });
    } 
    if ((await knex.schema.hasTable("jum_agent"))) {
        if (!(await knex.schema.hasColumn("jum_agent", "last_socket_id"))) {
            await knex.schema.alterTable("jum_agent", function (table) {
                table.string("last_socket_id").notNullable().defaultTo("");
                table.jsonb("current_channels");
            });
        }
        if (!(await knex.schema.hasColumn("jum_agent", "current_channels"))) {
            await knex.schema.alterTable("jum_agent", function (table) {
                table.jsonb("current_channels");
            });
        }
        if (!(await knex.schema.hasColumn("jum_agent", "last_online_date"))) {
            await knex.schema.alterTable("jum_agent", function (table) {
                table.string("last_online_date", 40);
            });
        }
        if (!(await knex.schema.hasColumn("jum_agent", "options"))) {
            await knex.schema.alterTable("jum_agent", function (table) {
                table.json("options");
            });
        }
    }

    if (!(await knex.schema.hasTable("cache"))) {
        await knex.schema.createTable("cache", function (table) {
            table.string("key").primary();
            table.jsonb("data");
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

exports.down = async function (knex) {
    // if (await knex.schema.hasTable("package")) {
    //     await knex.schema.dropTable("package");
    // }
    // if (await knex.schema.hasTable("package_version")) {
    //     await knex.schema.dropTable("package_version");
    // }
};
