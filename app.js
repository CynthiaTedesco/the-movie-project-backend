// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

// server.js
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const { signUp, login } = require('./src/routes/auth')
const {
  toggleValidity,
  allMovies,
  fullMovie,
  movieGenres,
  movieCharacters,
  movieDirectors,
  movieLanguages,
  movieProducers,
  movieRestrictions,
  movieWriters,
  deleteMovie,
  updateMovie
} = require('./src/routes/movies')
const { allGenres } = require('./src/routes/genres')
const { allLanguages } = require('./src/routes/languages')
const { allProducers } = require('./src/routes/producers')
const { allMovieTypes } = require('./src/routes/movieTypes')
const { allWriters } = require('./src/routes/writers')
const { allCharacters, allCharacterTypes } = require('./src/routes/characters')
const { allDirectors } = require('./src/routes/directors')
const { allOrigins } = require('./src/routes/origins')
const { allTimes } = require('./src/routes/times')
const { allPlaces } = require('./src/routes/places')

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
//genres
app.get('/api/genres', allGenres)
//people
app.get('/api/writers', allWriters)
app.get('/api/characters', allCharacters)
app.get('/api/character_types', allCharacterTypes)
app.get('/api/directors', allDirectors)
//producers
app.get('/api/producers', allProducers)
//origins
app.get('/api/origins', allOrigins)
//places
app.get('/api/places', allPlaces)
//times
app.get('/api/times', allTimes)
//languages
app.get('/api/languages', allLanguages)
//movie types
app.get('/api/movie_types', allMovieTypes)

//movies
app.get('/api/movies', allMovies)
app.get('/api/movies/:id/genres', movieGenres)
app.get('/api/movies/:id/characters', movieCharacters)
app.get('/api/movies/:id/directors', movieDirectors)
app.get('/api/movies/:id/writers', movieWriters)
app.get('/api/movies/:id/restrictions', movieRestrictions)
app.get('/api/movies/:id/languages', movieLanguages)
app.get('/api/movies/:id/producers', movieProducers)

app.post('/api/movies/:id/toggleValidity', toggleValidity)
app.post('/api/signUp', signUp)
app.post('/api/login', login)

app.get('/api/movies/:id', fullMovie)
app.delete('/api/movies/:id', deleteMovie)
app.post('/api/movies/:id', updateMovie)

module.exports = app
