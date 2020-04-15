const models = require('../../models')

function updatePoster(movie, newPoster) {
  if (!newPoster.id) {
    return models.poster.create({
      url: newPoster.url,
      poster_type_id: newPoster.poster_type_id,
    })
  } else {
    return models.poster
      .findOne({ where: { id: newPoster.id } })
      .then((toBeUpdated) => {
        toBeUpdated.poster_type_id = newPoster.poster_type_id
        toBeUpdated.url = newPoster.url
        return toBeUpdated.save()
      })
  }
}

module.exports = {
  updatePoster,
}
