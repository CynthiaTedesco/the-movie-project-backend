const models = require('../../models')

const allDistributionCompanies = (req, res) => {
  models.distribution_company
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allDistributionCompanies,
}
