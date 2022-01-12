import { KnexConnector } from "lisco";

const table = "cache";

class Cache {
    static async set(key, value) {
        const knex = KnexConnector.connection;

        let exists = await knex(table).where({ key }).first();
        if (!exists) {
            await knex(table).insert({ key, data: value });
        }
        await knex(table).update({ data: value }).where({ key });
    }

    static async get(key) {
        const knex = KnexConnector.connection;
        return knex(table).where({ key }).first();
    }

    static async del(key) {
        const knex = KnexConnector.connection;
        await knex(table).where({ key }).delete();
    }

    static async resetAll() {
        try {
            const knex = KnexConnector.connection;
            await knex(table).delete();
        } catch (ex) {
            console.error(ex);
        }
    }
}

export default Cache;
