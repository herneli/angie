// Update with your config settings.

module.exports = {

    test: {
        client: 'sqlite3',
        connection: {
            filename: './test.sqlite3'
        },
        migrations: {
            tableName: 'knex_migrations'
        },
        useNullAsDefault: true
    },

    development: {
        client: 'pg',
        connection: {
            user: "postgres",
            password: "root",
            host: "localhost",
            port: 5432,
            database: "angie"
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },


    production: {
        client: 'pg',
        connection: {
            user: "postgres",
            password: "root",
            host: "localhost",
            port: 5432,
            database: "angie"
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }

};
