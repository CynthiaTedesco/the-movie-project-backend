const models = require('../../models')

const allCinematographies = (req, res) => {
  models.cinematography
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allCinematographies,
}
