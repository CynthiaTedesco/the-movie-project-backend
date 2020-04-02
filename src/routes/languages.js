const models = require('../../models')

const allLanguages = (req, res) => {
  models.language
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allLanguages
}
