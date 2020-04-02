const models = require('../../models')

const allTimes = (req, res) => {
  models.time
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allTimes
}
