const UserModel = require('../models/user')
const models = require('../models')
var parse = require('postgres-date')

import * as jwt from 'jsonwebtoken'
const bcrypt = require('bcrypt')
const saltRounds = 10

function generateToken(user) {
  const data = {
    _id: user._id,
    username: user.username
  }
  const signature = 'MySuP3R_z3kr3t'
  const expiration = '6h'

  return jwt.sign({ data }, signature, { expiresIn: expiration })
}

export async function login(req, res) {
  const userRecord = await models['user'].findOne({
    where: { username: req.body.username }
  })
  if (!userRecord) {
    throw new Error('User not found')
  } else {
    bcrypt.compare(req.body.password, userRecord.password, function(
      err,
      result
    ) {
      if (result == true) {
        return res.status(200).send({
          user: userRecord.username,
          token: generateToken(userRecord)
        })
      } else {
        throw new Error('Incorrect password')
      }
    })
  }
  return {
    user: userRecord.username,
    token: generateToken(userRecord)
  }
}

export async function signUp(req, res) {
  if (req.body.password && req.body.username) {
    const password = req.body.password
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) {
        throw err
      }
      // Store hash in your password DB.
      const now = new Date().toISOString()
      models.sequelize
        .query(
          `INSERT into users (username, password, "createdAt", "updatedAt") values ('${req.body.username}', '${hash}', '${now}', '${now}')`
        )
        .then(results => res.status(200).send(results))
        .catch(err => {
          throw new Error(err)
        })
    })
  } else {
    throw new Error('required password')
  }
}
