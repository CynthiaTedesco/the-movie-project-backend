const models = require('../../models')
const {
  updateGenres,
  updateCharacters,
  deleteRepeatedAssociations,
} = require('../controllers/Associations')
const { updatePoster } = require('../controllers/Poster')
const { updateStoryOrigin } = require('../controllers/StoryOrigin')
const { fetchFullMovieFromAPIS, updateJSON } = require('../services/movies')
const { getMergedMovie } = require('../helpers')

const toggleValidity = async function (req, res) {
  await models['movie']
    .update(
      { valid: models.sequelize.literal('NOT valid') },
      {
        where: {
          id: req.params.id,
        },
      }
    )
    .then(() => res.status(200).send('success'))
    .catch((err) => {
      console.log(err)
      return res.status(500).send('Error trying to toggle validity')
    })
}
const fetchFullMovieFromDB = async (where) => {
  const movie = await models.movie.findOne({
    where: where,
    include: [
      { model: models.poster, as: 'poster' },
      { model: models.story_origin, as: 'story_origin' },
      { model: models.movie_type, as: 'type' },
      { model: models.place, as: 'set_in_place' },
      { model: models.time, as: 'set_in_time' },
    ],
  })

  const id = movie.id
  const genresAssoc = await genres(id)
  movie.dataValues.genres = genresAssoc.dataValues.genres

  const producersAssoc = await producers(id)
  movie.dataValues.producers = producersAssoc.dataValues.producers

  const languagesAssoc = await languages(id)
  movie.dataValues.languages = languagesAssoc.dataValues.languages

  const restrictionsAssoc = await restrictions(id)
  movie.dataValues.restrictions = restrictionsAssoc.dataValues.restrictions

  const charactersAssoc = await characters(id)
  movie.dataValues.characters = charactersAssoc.dataValues.characters

  const directorsAssoc = await directors(id)
  movie.dataValues.directors = directorsAssoc.dataValues.directors

  const writtersAssoc = await writers(id)
  movie.dataValues.writers = writtersAssoc.dataValues.writers

  return movie
}
const fullMovie = async function (req, res) {
  fetchFullMovieFromDB({ id: req.params.id }).then((movie) => {
    res.status(200).send(movie)
  })
}

const genres = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.genre,
        as: 'genres',
        required: false,
        attributes: ['id', 'name'],
        through: {
          model: models['movies_genres'],
          as: 'movies_genres',
          attributes: ['primary'],
        },
      },
    ],
  })
}
const producers = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.producer,
        as: 'producers',
        required: false,
        attributes: ['id', 'name', 'country'],
        through: {
          model: models['movies_producers'],
          as: 'movies_producers',
          attributes: ['primary'],
        },
      },
    ],
  })
}
const languages = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.language,
        as: 'languages',
        required: false,
        attributes: ['id', 'name', 'code'],
        through: {
          model: models['movies_languages'],
          as: 'movies_languages',
          attributes: ['primary'],
        },
      },
    ],
  })
}
const characters = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.person,
        as: 'characters',
        required: false,
        attributes: ['id', 'name', 'date_of_birth', 'gender'],
        through: {
          model: models['movies_characters'],
          as: 'movies_characters',
          attributes: ['main', 'character_name', 'type'],
        },
      },
    ],
  })
}
const directors = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.person,
        as: 'directors',
        required: false,
        attributes: ['id', 'name', 'date_of_birth', 'gender'],
        through: {
          model: models['movies_directors'],
          as: 'movies_directors',
          attributes: ['primary'],
        },
      },
    ],
  })
}
const writers = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.person,
        as: 'writers',
        required: false,
        attributes: ['id', 'name', 'date_of_birth', 'gender'],
        through: {
          model: models['movies_writers'],
          as: 'movies_writers',
          attributes: ['primary', 'detail'],
        },
      },
    ],
  })
}
const restrictions = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ['id', 'title'],
    include: [
      {
        model: models.restriction,
        as: 'restrictions',
        required: false,
        attributes: ['id', 'name', 'country'],
        through: {
          model: models['movies_restrictions'],
          as: 'movies_restrictions',
          attributes: ['primary'],
        },
      },
    ],
  })
}

const movieGenres = function (req, res) {
  genres(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}
const movieRestrictions = function (req, res) {
  restrictions(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}
const movieWriters = function (req, res) {
  writers(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}
const movieDirectors = function (req, res) {
  directors(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}
const movieCharacters = function (req, res) {
  characters(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}
const movieProducers = function (req, res) {
  producers(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}
const movieLanguages = function (req, res) {
  languages(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log)
}

const allMovies = (req, res) => {
  models.movie
    .findAll({
      include: [
        { model: models.poster, as: 'poster' },
        { model: models.time, as: 'set_in_time' },
        { model: models.place, as: 'set_in_place' },
        { model: models.story_origin, as: 'story_origin' },
      ],
    })
    .then((movies) => res.status(200).send(movies))
    .catch(console.log)
}

const deleteMovie = (req, res) => {
  models.movie
    .destroy({
      where: { id: req.params.id },
    })
    .then(() => res.status(200).send('Successful delete'))
    .catch(console.log)
}

const deleteAllRepeatedAssociations = (req, res) => {
  models.movie
    .findAll()
    .then((movies) => {
      movies.forEach(async (movie) => {
        const promises = [
          deleteRepeatedAssociations('genre_id', 'movies_genres', movie.id),
          deleteRepeatedAssociations(
            'language_id',
            'movies_languages',
            movie.id
          ),
          deleteRepeatedAssociations(
            'restriction_id',
            'movies_restrictions',
            movie.id
          ),
          deleteRepeatedAssociations(
            'producer_id',
            'movies_producers',
            movie.id
          ),
          deleteRepeatedAssociations(
            'person_id',
            'movies_writers',
            movie.id,
            true
          ),
          deleteRepeatedAssociations('person_id', 'movies_directors', movie.id),
          deleteRepeatedAssociations(
            'person_id',
            'movies_characters',
            movie.id,
            'characters'
          ),
        ]
        return Promise.all(promises)
      })
    })
    .then(() => {
      return res
        .status(200)
        .send({ message: 'Successfully deleted all duplicated' })
    })
    .catch((err) => {
      console.log(err)
      return res
        .status(500)
        .send({ message: 'Error while deleting repeated associations', err })
    })
}

const updateMovieEndpoint = (req, res) => {
  console.log('updateMovieEndpoint', req.body)
  return updateMovie({ id: req.params.id }, req.body)
    .then((updated) => {
      if (updated) {
        return res
          .status(200)
          .send({ message: 'Successful autoupdate', updated: updated })
      } else {
        res.status(204).send({
          message: `No content to update requested movie: ${req.params.id}`,
        })
      }
    })
    .catch((err) => {
      console.log(err)
      return res
        .status(500)
        .send(`Error trying to update movie: ${req.params.id}`)
    })
}
const updateMovie = (where, updates, dataFromAPIS) => {
  console.log('UPDATE MOVIE, updates', updates)
  return models.movie
    .findOne({
      where: where,
    })
    .then(async (movie) => {
      if (movie) {
        await updateSimpleFields(movie, updates)
        await updateLists(movie, updates)

        updateJSON(movie, dataFromAPIS, updates)
        return movie
      } else {
        return null
      }
    })
    .catch((err) => {
      console.log(err)
      throw err
    })
}

const updateLists = async (movie, updates) => {
  if (updates.genres) {
    await updateGenres(movie.dataValues, updates.genres)
  }
  if (updates.characters) {
    await updateCharacters(movie.dataValues, updates.characters)
  }
  if (updates.restrictions) {
    await updateRestrictions(movie.dataValues, updates.restrictions)
  }
  if (updates.producers) {
    await updateProducers(movie.dataValues, updates.producers)
  }
}
const updateSimpleField = (movie, update) => {
  const key = update[0]
  const value = update[1]
  if (value) {
    movie[key] = value
    return true
  } else {
    return false
  }
}

const asyncSwitchCase = (movie, updates) => {
  const noSingleFields = [
    'genres',
    'production_companies',
    'production_countries',
    'restrictions',
    'directors',
    'writers',
    'actors',
  ]
  const toIgnore = [
    'original_language',
    'spoken_languages',
    'status',
    'subsFileName',
  ].concat(noSingleFields)

  let updated = false
  return new Promise((resolve) => {
    Object.entries(updates).forEach(async (entry, index, arr) => {
      switch (entry[0]) {
        case 'poster': {
          //TODO check what happens when we delete the poster
          const poster = await updatePoster(movie, updates.poster)
          if (updates.poster.new && poster.id) {
            movie.poster_id = poster.id
            updated = true
          }
          break
        }
        case 'story_origin': {
          if (!updates.story_origin) {
            //it has been deleted!
            movie.story_origin_id = null
            updated = true
          } else {
            const origin = await updateStoryOrigin(movie, updates.story_origin)
            if (movie.story_origin_id !== origin.id) {
              movie.story_origin_id = origin.id
              updated = true
            }
          }
          break
        }
        default: {
          if (toIgnore.indexOf(entry[0]) === -1) {
            const hasBeenUpdated = updateSimpleField(movie, entry)
            updated = updated || hasBeenUpdated
          }
        }
      }

      if (index + 1 === arr.length) {
        return resolve(updated)
      }
    })
  })
}
const updateSimpleFields = async (movie, updates, fullMovie) => {
  const updated = await asyncSwitchCase(movie, updates)

  if (fullMovie && fullMovie.tmdb_id && !movie.tmdb_id) {
    movie.tmdb_id = fullMovie.tmdb_id
  }
  if (updated) {
    return movie.save()
  }

  return movie
}
const autoUpdateMovie = async (req, res) => {
  const id = req.body.tmdb_id
    ? { tmdb_id: req.body.tmdb_id }
    : { imdb_id: req.body.imdb_id }

  const movie_fromAPIS = await fetchFullMovieFromAPIS(id)
  const movie_fromDB = await fetchFullMovieFromDB(id)
  const updatedFields = getMergedMovie(
    movie_fromDB,
    movie_fromAPIS,
    'db',
    'api'
  )
  if (updatedFields && Object.keys(updatedFields).length) {
    await updateMovie(
      { imdb_id: movie_fromDB.imdb_id },
      updatedFields,
      movie_fromAPIS
    )
    return res
      .status(200)
      .send({ message: 'Successful autoupdate', updated: movie_fromAPIS })
  }
}

module.exports = {
  toggleValidity,
  fullMovie,
  allMovies,
  movieGenres,
  movieRestrictions,
  movieCharacters,
  movieDirectors,
  movieLanguages,
  movieProducers,
  movieWriters,
  deleteMovie,
  deleteAllRepeatedAssociations,
  updateMovieEndpoint,
  autoUpdateMovie,
}
