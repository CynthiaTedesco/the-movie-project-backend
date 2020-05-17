const models = require('../../models')

const allSeries = (req, res) => {
  models.serie
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allSeries: allSeries,
}
