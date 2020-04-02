const models = require('../../models')

const allMovieTypes = (req, res) => {
  models.movie_type
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allMovieTypes
}
