const models = require('../../models')
const {
  updateGenres,
  updateCharacters,
  deleteRepeatedAssociations,
} = require('../controllers/Associations')
const { updatePoster } = require('../controllers/Poster')
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

const fullMovie = async function (req, res) {
  const movie = await models.movie.findOne({
    where: { id: req.params.id },
    include: [
      { model: models.poster, as: 'poster' },
      { model: models.story_origin, as: 'story_origin' },
      { model: models.movie_type, as: 'type' },
      { model: models.place, as: 'set_in_place' },
      { model: models.time, as: 'set_in_time' },
    ],
  })

  const genresAssoc = await genres(req.params.id)
  movie.dataValues.genres = genresAssoc.dataValues.genres

  const producersAssoc = await producers(req.params.id)
  movie.dataValues.producers = producersAssoc.dataValues.producers

  const languagesAssoc = await languages(req.params.id)
  movie.dataValues.languages = languagesAssoc.dataValues.languages

  const restrictionsAssoc = await restrictions(req.params.id)
  movie.dataValues.restrictions = restrictionsAssoc.dataValues.restrictions

  const charactersAssoc = await characters(req.params.id)
  movie.dataValues.characters = charactersAssoc.dataValues.characters

  const directorsAssoc = await directors(req.params.id)
  movie.dataValues.directors = directorsAssoc.dataValues.directors

  const writtersAssoc = await writers(req.params.id)
  movie.dataValues.writers = writtersAssoc.dataValues.writers
  res.status(200).send(movie)
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

const updateMovie = (req, res) => {
  models.movie
    .findOne({
      where: { id: req.params.id },
    })
    .then(async (movie) => {
      await updateSimpleFields(movie, req.body)
      await updateLists(movie, req.body)
      return res
        .status(200)
        .send({ message: 'Successful update', updated: movie })
    })
    .catch((err) => {
      console.log(err)
      return res
        .status(500)
        .send({ message: 'Error while updating movie', err })
    })
}

const updateLists = (movie, updates) => {
  if (updates.genres) {
    updateGenres(movie.dataValues, updates.genres)
  }
  if (updates.characters) {
    updateCharacters(movie.dataValues, updates.characters)
  }
  if (updates.restrictions) {
    updateRestrictions(movie.dataValues, updates.restrictions)
  }
  if (updates.producers) {
    updateProducers(movie.dataValues, updates.producers)
  }
}
const updateSimpleFields = async (movie, updates) => {
  let updated = false
  if (updates.revenue) {
    movie.revenue = updates.revenue
    updated = true
  }
  if (updates.overview) {
    movie.overview = updates.overview
    updated = true
  }
  if (updates.poster) {
    const poster = await updatePoster(movie, updates.poster)
    if (updates.poster.new && poster.id) {
      movie.poster_id = poster.id
      updated = true
    }
  }

  if (updated) {
    return movie.save()
  }

  return movie
}

const { fetchMovieFullDetails } = require('../services/movies')

const autoUpdateMovie = async (req, res) => {
  const movie = await fetchMovieFullDetails(req.params.tmdb_id)

  //TODO update movies.json
  //TODO persist!

  res.status(200).send(movie)
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
  updateMovie,
  autoUpdateMovie,
}
