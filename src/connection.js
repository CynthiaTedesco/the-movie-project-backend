'use strict';
import Sequelize from 'sequelize';

import 'dotenv/config';

let db;

export async function connectDB() {
    db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    return db;
}

export async function disconnectDB() {
    await db.close();
    console.log('Client disconnected successfully');
}
