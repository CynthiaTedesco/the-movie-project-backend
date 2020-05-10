const models = require('../../models')

function updateStoryOrigin(movie, newOrigin) {
  if (!newOrigin.id) {
    return models.story_origin.create({
      name: newOrigin.name,
    })
  } else {
    return models.story_origin
      .findOne({ where: { id: newOrigin.id } })
      .then((toBeUpdated) => {
        toBeUpdated.name = newOrigin.name
        return toBeUpdated.save()
      })
  }
}

module.exports = {
  updateStoryOrigin,
}
