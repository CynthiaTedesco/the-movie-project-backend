const models = require('../../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { processPeople } = require('../services/themoviedb')

const allWriters = async (req, res) => {
  const ids = await models.movies_writers.findAll({
    attributes: ['person_id'],
    raw: true,
  })

  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map((a) => a.person_id),
        },
      },
    })
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const allCharacters = async (req, res) => {
  const ids = await models.movies_characters.findAll({
    attributes: ['person_id'],
    raw: true,
  })
  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map((a) => a.person_id),
        },
      },
    })
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const allCharacterTypes = (req, res) => {
  models.character_type
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const allDirectors = async (req, res) => {
  const ids = await models['movies_directors'].findAll({
    attributes: ['person_id'],
    raw: true,
  })
  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map((a) => a.person_id),
        },
      },
    })
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}
const updatePeopleDetails = async (movie) => {
  let people = []
  if (movie) {
    const characters_ids = await models.movies_characters.findAll({
      where: { movie_id: movie.id },
      attributes: ['person_id'],
      raw: true,
    })
    const directors_ids = await models.movies_directors.findAll({
      where: { movie_id: movie.id },
      attributes: ['person_id'],
      raw: true,
    })
    const writers_ids = await models.movies_writers.findAll({
      where: { movie_id: movie.id },
      attributes: ['person_id'],
      raw: true,
    })

    const ids = characters_ids
      .map((a) => a.person_id)
      .concat(directors_ids.map((a) => a.person_id))
      .concat(writers_ids.map((a) => a.person_id))

    people = await models.person.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        [Op.or]: [{ date_of_birth: null }, { gender: null }],
      },
    })
  } else {
    people = await models.person.findAll({
      where: {
        [Op.or]: [{ date_of_birth: null }, { gender: null }],
      },
    })
  }
  if (people.length) {
    return await processPeople(people)
  } else {
    return true
  }
}
const updatePeopleDetailsEndpoint = (req, res) => {
  models.person
    .findAll({
      where: {
        [Op.or]: [{ date_of_birth: null }, { gender: null }],
      },
    })
    .then((results) => {
      processPeople(results)
        .then(() => {
          res.status(200).send('People details have been successfully updated!')
        })
        .catch(console.log)
    })
}

const allMoviesDirectors = (req, res) => {
  models.movies_directors
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const allMoviesCharacters = (req, res) => {
  models.movies_characters
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  updatePeopleDetailsEndpoint,
  updatePeopleDetails,
  allDirectors,
  allWriters,
  allCharacters,
  allCharacterTypes,
  allMoviesDirectors,
  allMoviesCharacters
}
