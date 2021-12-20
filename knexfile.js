// Update with your config settings.

module.exports = {

    development: {
        client: "pg",
        connection: {
            user: "postgres",
            password: "root",
            host: "localhost",
            port: 3132,
            database: "angie",
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },

    production: {
        client: "pg",
        connection: {
            user: "postgres",
            password: "root",
            host: "localhost",
            port: 3132,
            database: "angie",
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
};
