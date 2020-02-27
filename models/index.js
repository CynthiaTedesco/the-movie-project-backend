'use strict'

var fs = require('fs')
var path = require('path')
var Sequelize = require('sequelize')
var basename = path.basename(__filename)

var db = {}
var env = process.env.NODE_ENV || 'development'
var config = require(__dirname + '/../config/config.js')[env]

if (!global.hasOwnProperty('models')) {
  var Sequelize = require('sequelize'),
    sequelize = null
  if (process.env.DATABASE) {
    // the application is executed on Heroku ... use the postgres         database
    sequelize = new Sequelize(process.env.DATABASE, {
      dialect: 'postgres',
      protocol: 'postgres',
      port: 5432,
      host: '<heroku host>',
      logging: true //false
    })
  } else {
    // the application is executed on the local machine ... use mysql
    if (config.use_env_variable) {
      var sequelize = new Sequelize(
        process.env[config.use_env_variable],
        config
      )
    } else {
      var sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
      )
    }
  }

  fs.readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
      )
    })
    .forEach(file => {
      var model = sequelize['import'](path.join(__dirname, file))
      db[model.name] = model
    })

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelize
  db.Sequelize = Sequelize

  // global.models = {
  //   Sequelize: Sequelize,
  //   sequelize: sequelize,
  //   User: sequelize.import(__dirname + '/user')
  //   // add your other models here
  // }
}
// module.exports = global.models

module.exports = db
