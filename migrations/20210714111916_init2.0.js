
exports.up = async function (knex) {
    
    if (!await knex.schema.hasTable('historic')) {
        await knex.schema.createTable('historic', function (table) {
            table.increments();
            table.string('date', 30).notNullable();
            table.integer('user_id');
            table.string('action_url');
            table.string('method');
            table.integer('time_spent');
        });
    }
    if (!await knex.schema.hasTable('historic_data')) {
        await knex.schema.createTable('historic_data', function (table) {
            table.increments();
            table.integer('historic_id').notNullable();
            table.json('data');
            table.json('client_data');
        });
    }
    if (!await knex.schema.hasTable('ldap_host')) {
        await knex.schema.createTable('ldap_host', function (table) {
            table.increments();
            table.string('name', 100).notNullable();
            table.integer('active', 1).notNullable();
            table.string('url').notNullable();
            table.string('query_base').notNullable();
            table.string('query_user').notNullable();
            table.string('query_password').notNullable();
            table.text('query').notNullable();
        });
    }
    if (!await knex.schema.hasTable('profile')) {
        await knex.schema.createTable('profile', function (table) {
            table.increments();
            table.string('name').notNullable();
        });
    }

    if (!await knex.schema.hasTable('profile_app_section')) {
        await knex.schema.createTable('profile_app_section', function (table) {
            table.increments();
            table.integer('id_profile');
            table.integer('id_app_section');
            table.string('dirayaSection');
        });
    }

    if (!await knex.schema.hasTable('profile_user')) {
        await knex.schema.createTable('profile_user', function (table) {
            table.increments();
            table.integer('profile_id').notNullable();
            table.integer('user_id').notNullable();
        });
    }

    if (!await knex.schema.hasTable('settings')) {
        await knex.schema.createTable('settings', function (table) {
            table.increments();
            table.string('cfg_key').notNullable();
            table.string('cfg_value');
            table.string('description');
            table.string('value_type', 10);
            table.string('name');
            table.integer('overridable', 1).notNullable();
        });
    }

    if (!await knex.schema.hasTable('settings_values')) {
        await knex.schema.createTable('settings_values', function (table) {
            table.increments();
            table.string('cfg_key').notNullable();
            table.string('value').notNullable();
            table.string('text').notNullable();
        });
    }
    

    if (!await knex.schema.hasTable('users')) {
        await knex.schema.createTable('users', function (table) {
            table.increments();
            table.string('username').notNullable();
            table.string('password').notNullable();
            table.integer('active', 1).notNullable().defaultTo(1);
            table.json('dashboard');
            table.string('name');
            table.json('visible_filters');
            table.json('filter_values');
            table.json('stored_filters');
            table.json('table_config');
            table.json('actions_config');
            table.string('last_login_date', 30)
        });
    }

    if (!await knex.schema.hasTable('users_settings')) {
        await knex.schema.createTable('users_settings', function (table) {
            table.increments();
            table.integer('settings_id').notNullable();
            table.integer('user_id').notNullable();
            table.string('cfg_key').notNullable();
            table.string('cfg_value').notNullable();
        });
    }
};

exports.down = async function (knex) {
    
    if (await knex.schema.hasTable('historic')) {
        await knex.schema.dropTable('historic');
    }
    if (await knex.schema.hasTable('historic_data')) {
        await knex.schema.dropTable('historic_data');
    }
    if (await knex.schema.hasTable('ldap_host')) {
        await knex.schema.dropTable('ldap_host');
    }
    if (await knex.schema.hasTable('profile')) {
        await knex.schema.dropTable('profile');
    }
    if (await knex.schema.hasTable('profile_app_section')) {
        await knex.schema.dropTable('profile_app_section');
    }
    if (await knex.schema.hasTable('profile_user')) {
        await knex.schema.dropTable('profile_user');
    }
    
    if (await knex.schema.hasTable('settings')) {
        await knex.schema.dropTable('settings');
    }
    if (await knex.schema.hasTable('settings_values')) {
        await knex.schema.dropTable('settings_values');
    }
    
    if (await knex.schema.hasTable('users')) {
        await knex.schema.dropTable('users');
    }
    if (await knex.schema.hasTable('users_settings')) {
        await knex.schema.dropTable('users_settings');
    }
};
