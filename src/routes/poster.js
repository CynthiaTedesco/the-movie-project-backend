const models = require('../../models')

const allPosterTypes = (req, res) => {
  models.poster_type
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allPosterTypes,
}
