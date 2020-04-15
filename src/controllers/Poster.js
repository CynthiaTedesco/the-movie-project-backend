const models = require('../../models')

function updatePoster(movie, newPoster) {
  return models.poster.findOne({where: {id: newPoster.id}}).then((toBeUpdated) => {
    toBeUpdated.poster_type_id = newPoster.poster_type_id
    toBeUpdated.url = newPoster.url
    return toBeUpdated.save()
  })
}

module.exports = {
  updatePoster,
}
