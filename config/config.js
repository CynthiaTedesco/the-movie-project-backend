require('dotenv/config')

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT
    }
    //  "test": {
    // username: 'postres',
    // password: root,
    // database: 'mp1',
    // host: 'localhost',
    // port: 5433,
    // dialect: 'postgres'
    //    "operatorsAliases": false
  }
  //  "production": {
  //    "username": "root",
  //    "password": null,
  //    "database": "database_production",
  //    "host": "127.0.0.1",
  //    "dialect": "mysql",
  //    "operatorsAliases": false
  //  }
// }
