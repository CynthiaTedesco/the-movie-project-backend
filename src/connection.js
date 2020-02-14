'use strict'
var Sequelize = require('sequelize')
var env = process.env.NODE_ENV || 'development'
var config = require(__dirname + '/../config/config.js')[env]
import 'dotenv/config'

let db

export async function connectDB() {
  const options = {
    ...config,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }

  if (config.use_env_variable) {
    db = new Sequelize(process.env[config.use_env_variable], options)
  } else {
    db = new Sequelize(
      config.database,
      config.username,
      config.password,
      options
    )
  }

  return db
}

export async function disconnectDB() {
  await db.close()
  console.log('Client disconnected successfully')
}
