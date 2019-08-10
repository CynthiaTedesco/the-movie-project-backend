'use strict';
const {Client} = require('pg');

const client = new Client({
    user: "postgres",
    password: "root",
    host: 'localhost',
    port: 5433,
    database: 'mp1'
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
