const models = require('../../models')

const allRestrictions = (req, res) => {
  models.restriction
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

const allMoviesRestrictions = (req, res) => {
  models.movies_restrictions
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allRestrictions,
  allMoviesRestrictions,
}
