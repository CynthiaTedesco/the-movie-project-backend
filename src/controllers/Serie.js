const models = require('../../models')

function updateSerie(movie, newSerie) {
  if (!newSerie.id) {
    return models.serie.create({
      name: newSerie.name,
    })
  } else {
    return models.serie
      .findOne({ where: { id: newSerie.id } })
      .then((toBeUpdated) => {
        toBeUpdated.name = newSerie.name
        return toBeUpdated.save()
      })
  }
}

module.exports = {
  updateSerie,
}
