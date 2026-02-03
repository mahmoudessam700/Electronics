// @ts-nocheck
const { Pool } = require('pg');

let poolInstance;

const createPool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    });
};

const getPool = () => {
    if (!poolInstance) {
        poolInstance = createPool();
    }
    return poolInstance;
};

const withTransaction = async (callback) => {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getPool,
    withTransaction,
};
