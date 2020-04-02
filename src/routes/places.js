const models = require('../../models')

const allPlaces = (req, res) => {
  models.place
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allPlaces
}
