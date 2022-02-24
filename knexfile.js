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
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            database: process.env.DATABASE_NAME,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
};
