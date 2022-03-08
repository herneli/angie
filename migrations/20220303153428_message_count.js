exports.up = async function (knex) {
    await knex.raw(`CREATE MATERIALIZED VIEW IF NOT EXISTS message_counts AS 
                    SELECT channel_id,	
                           COUNT(*) as "total",
                           COUNT(case WHEN status = 'error' then 1 ELSE NULL END) AS "error"
                    FROM zmessages
                    GROUP BY channel_id;`);
};

exports.down = async function (knex) {
    await knex.raw(`DROP MATERIALIZED VIEW IF EXISTS message_counts;`);
};
