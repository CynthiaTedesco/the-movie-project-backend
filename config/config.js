require('dotenv/config')

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false
  },
  test: {
    use_env_variable: "HEROKU_DB_URL",
    dialect: process.env.TEST_DB_DIALECT,
    dialectOptions: {
      ssl: true
    }
  }
  //  production: {
  //    use_env_variable: "HEROKU_DB_URL"
  //    dialect: "postgres",
  //  }
}
