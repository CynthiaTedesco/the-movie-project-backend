// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

// server.js
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')

const Movie = require('./src/controllers/Movie')
const models = require('./models')
const cors = require('cors')

// Set up the express app
const app = express()
// Log requests to the console.
app.use(logger('dev'))

// app.use(express.json());
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
//will be www who will put the server to listen
// app.listen(3000);

app.get('/', (req, res) => {
  return res.status(200).send({
    message: 'YAY! Congratulations! Your first endpoint is working. Super!'
  })
})

// get all movies
app.get('/api/movies', (req, res) => {
  models.movie
    .findAll({
      include: [{ model: models.poster, as: 'poster' }]
    })
    .then(movies => res.status(200).send(movies))
    .catch(console.log)
})
// get movie restrictions
// app.get('/api/restrictions', (req, res) => {

//   models.movie
//     .findAll({
//       attributes: ['id', 'title'],
//       include: [{ model: models.restriction, as: 'restrictions' }]
//     })
//     .then(movies => res.status(200).send(movies))
//     .catch(console.log)
// })

// get all genres
app.get('/api/genres', (req, res) => {
  models['genre'].findAll().then(results => res.status(200).send(results))
})
// get all story origins
app.get('/api/story-origins', (req, res) => {
  models['story_origin']
    .findAll()
    .then(results => res.status(200).send(results))
})
// get all places
app.get('/api/places', (req, res) => {
  models['place'].findAll().then(results => res.status(200).send(results))
})
// get all times
app.get('/api/times', (req, res) => {
  models['time'].findAll().then(results => res.status(200).send(results))
})

// movie characters, writers, languages, producers, directors, restrictions

module.exports = app
