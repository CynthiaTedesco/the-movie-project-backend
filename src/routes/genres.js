const models = require('../../models')

const allGenres = (req, res) => {
  models.genre
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allGenres
}
