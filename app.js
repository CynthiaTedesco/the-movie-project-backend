// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

// server.js
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const { signUp, login } = require('./src/routes/auth')
const { toggleValidity, allMovies, fullMovie } = require('./src/routes/movies')
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
app.get('/api/movies', allMovies)
app.get('/api/movies/:id', fullMovie)
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
//get all movies with genres
app.get('/api/movie-genres', (req, res) => {
  models['movies_genres']
    .findAll()
    .then(results => res.status(200).send(results))
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
  models['time'].findAll().then(results => res.status(200).send(results)) //!!!FIX showing repeated
})
// get all times
app.get('/api/movie/types', (req, res) => {
  models['movie_type'].findAll().then(results => res.status(200).send(results)) //!!!FIX showing repeated
})

app.post('/api/signUp', signUp)
app.post('/api/login', login)
app.post('/api/toggleValidity', toggleValidity)
// movie characters, writers, languages, producers, directors, restrictions

module.exports = app
