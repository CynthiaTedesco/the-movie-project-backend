'use strict';
import {Client} from 'pg';
import 'dotenv/config';

const client = new Client({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

export async function connectDB() {

    await client.connect();
    console.log('Client connected successfully');

    return client;
}

export async function disconnectDB() {
    client.end();
    console.log('Client disconnected successfully');
}
