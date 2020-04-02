const models = require('../../models')

const allOrigins = (req, res) => {
  models.story_origin
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allOrigins
}
