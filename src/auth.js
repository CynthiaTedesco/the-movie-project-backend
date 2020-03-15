const UserModel = require('../models/user')
const models = require('../models')
var parse = require('postgres-date')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10

function generateToken(user) {
  const data = {
    _id: user._id,
    username: user.username
  }
  const signature = 'MySuP3R_z3kr3t'
  const expiration = '6h' //21600s

  return jwt.sign({ data }, signature, { expiresIn: expiration })
}
const login = async function(req, res) {
  const userRecord = await models['user'].findOne({
    where: { username: req.body.username }
  })
  if (!userRecord) {
    return res.status(500).send('User not found')
  } else {
    bcrypt.compare(req.body.password, userRecord.password, function(
      err,
      result
    ) {
      if (result == true) {
        return res.status(200).send({
          user: userRecord.username,
          token: generateToken(userRecord),
          expiresIn: 21600 //6h
        })
      } else {
        return res.status(500).send('Incorrect password')
      }
    })
  }
  return {
    user: userRecord.username,
    token: generateToken(userRecord)
  }
}

const signUp = async function(req, res) {
  if (req.body.password && req.body.username) {
    const password = req.body.password
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) {
        return res.status(500).send('Error generating the hash')
      }
      // Store hash in your password DB.
      const now = new Date().toISOString()
      models.sequelize
        .query(
          `INSERT into users (username, password, "createdAt", "updatedAt") values ('${req.body.username}', '${hash}', '${now}', '${now}')`
        )
        .then(results => res.status(200).send(results))
        .catch(err => {
          return res.status(500).send('Error trying to create user')
        })
    })
  } else {
    return res.status(500).send('required password')
  }
}

module.exports = {
  login,
  signUp
}
