const models = require('../../models')

const allUniverses = (req, res) => {
  models.universe
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allUniverses: allUniverses,
}
