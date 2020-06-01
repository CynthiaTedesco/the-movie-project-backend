const models = require('../../models')

function updateDistributionCompany(movie, newDistributionCompany) {
  if (!newDistributionCompany.id) {
    return models.distribution_company.create({
      name: newDistributionCompany.name,
    })
  } else {
    return models.distribution_company
      .findOne({ where: { id: newDistributionCompany.id } })
      .then((toBeUpdated) => {
        toBeUpdated.name = newDistributionCompany.name
        return toBeUpdated.save()
      })
  }
}

module.exports = {
  updateDistributionCompany,
}
