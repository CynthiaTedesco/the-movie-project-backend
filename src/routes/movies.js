const models = require('../../models')

const toggleValidity = async function(req, res) {
  await models['movie']
    .update(
      { valid: models.sequelize.literal('NOT valid') },
      {
        where: {
          id: req.body.movie
        }
      }
    )
    .then(() => res.status(200).send('success'))
    .catch(err => {
      return res.status(500).send('Error trying to toggle validity')
    })
}

module.exports = {
  toggleValidity
}
