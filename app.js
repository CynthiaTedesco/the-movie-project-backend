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
  updateMovieEndpoint,
  autoUpdateMovie,
  autoUpdateAll,
  deleteAllRepeatedAssociations,
  updateRevenues,
  bulkUpdate
} = require('./src/routes/movies')
const { deleteOrphans } = require('./src/controllers/Associations');
const { allGenres, allMoviesGenres } = require('./src/routes/genres')
const { allLanguages, allMoviesLanguages } = require('./src/routes/languages')
const { allProducers, allMoviesProducers } = require('./src/routes/producers')
// const { allMovieTypes } = require('./src/routes/movieTypes')
const { allPosterTypes } = require('./src/routes/poster')
const {
  allWriters,
  allDirectors,
  allMoviesDirectors,
  allCharacters,
  allMoviesCharacters,
  allCharacterTypes,
  updatePeopleDetailsEndpoint,
} = require('./src/routes/people')
const { allOrigins } = require('./src/routes/origins')
// const { allTimes } = require('./src/routes/times')
// const { allPlaces } = require('./src/routes/places')
const { allCinematographies } = require('./src/routes/cinematographies');
const { allUniverses } = require('./src/routes/universes')
const { allSeries } = require('./src/routes/series')
const { allRestrictions, allMoviesRestrictions } = require('./src/routes/restrictions')

// const Movie = require('./src/controllers/Movie')
// const models = require('./models')
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
    message: 'YAY! Congratulations! Your first endpoint is working. Super!',
  })
})
//genres
app.get('/api/genres', allGenres)
app.get('/api/movies-genres', allMoviesGenres)
//people
app.get('/api/writers', allWriters)
app.get('/api/characters', allCharacters)
app.get('/api/movies-characters', allMoviesCharacters)
app.get('/api/character_types', allCharacterTypes)
app.get('/api/directors', allDirectors)
app.get('/api/movies-directors', allMoviesDirectors)
// //producers
// app.get('/api/producers', allProducers)
app.get('/api/producers', allProducers)
app.get('/api/movies-producers', allMoviesProducers)
//origins
app.get('/api/origins', allOrigins)
// //places
// app.get('/api/places', allPlaces)
//cinematographies
app.get('/api/cinematographies', allCinematographies)
//series
app.get('/api/series', allSeries)
//universes
app.get('/api/universes', allUniverses)
// //times
// app.get('/api/times', allTimes)
//languages
app.get('/api/languages', allLanguages)
app.get('/api/movies-languages', allMoviesLanguages)
// //movie types
// app.get('/api/movie_types', allMovieTypes)
//poster types
app.get('/api/poster_types', allPosterTypes)
//restrictions
app.get('/api/restrictions', allRestrictions)
app.get('/api/movies-restrictions', allMoviesRestrictions)

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
app.post('/api/movies/:id/update', updateMovieEndpoint)
app.post('/api/movies/autoUpdate', autoUpdateMovie)
app.post('/api/movies/autoUpdateAll', autoUpdateAll)
app.post('api/movies/updateRevenues', updateRevenues)
app.post('/api/people/updateDetails', updatePeopleDetailsEndpoint)
app.post('/api/movies/bulkUpdate', bulkUpdate)


app.post('/api/deleteRepeatedAssociations', deleteAllRepeatedAssociations)
app.post('/api/deleteOrphans', deleteOrphans)

module.exports = app
