const models = require('../../models')

function updateCinematography(movie, newCinematography) {
  if (!newCinematography.id) {
    return models.cinematography.create({
      name: newCinematography.name,
    })
  } else {
    return models.cinematography
      .findOne({ where: { id: newCinematography.id } })
      .then((toBeUpdated) => {
        toBeUpdated.name = newCinematography.name
        return toBeUpdated.save()
      })
  }
}

module.exports = {
  updateCinematography,
}
