const models = require('../../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { processPeople } = require('../services/themoviedb')

const allWriters = async (req, res) => {
  const ids = await models.movies_writers.findAll({
    attributes: ['id'],
    raw: true,
  })

  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map((a) => a.id),
        },
      },
    })
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const allCharacters = async (req, res) => {
  const ids = await models.movies_characters.findAll({
    attributes: ['id'],
    raw: true,
  })
  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map((a) => a.id),
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
    attributes: ['id'],
    raw: true,
  })
  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map((a) => a.id),
        },
      },
    })
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const updatePeopleDetails = (req, res) => {
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

module.exports = {
  updatePeopleDetails,
  allDirectors,
  allWriters,
  allCharacters,
  allCharacterTypes,
}
