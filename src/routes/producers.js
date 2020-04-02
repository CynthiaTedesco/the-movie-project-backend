const models = require('../../models')

const allProducers = (req, res) => {
  models.producer
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allProducers
}
