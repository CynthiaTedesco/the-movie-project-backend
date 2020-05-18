const models = require('../../models')

function updateUniverse(movie, newUniverse) {
  if (!newUniverse.id) {
    return models.universe.create({
      name: newUniverse.name,
    })
  } else {
    return models.universe
      .findOne({ where: { id: newUniverse.id } })
      .then((toBeUpdated) => {
        toBeUpdated.name = newUniverse.name
        return toBeUpdated.save()
      })
  }
}

module.exports = {
  updateUniverse,
}
