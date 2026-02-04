// @ts-nocheck
const mysql = require('mysql2/promise');

let poolInstance;

const createPool = () => {
    return mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

const getPool = () => {
    if (!poolInstance) {
        poolInstance = createPool();
    }
    return poolInstance;
};

const withTransaction = async (callback) => {
    const connection = await getPool().getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getPool,
    withTransaction,
};
