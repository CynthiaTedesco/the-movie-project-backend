const models = require('../../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const allWriters = async (req, res) => {
  const ids = await models.movies_writers.findAll({
    attributes: ['id'],
    raw: true
  })

  models.person
    .findAll({
      where: {
        id: {
          [Op.in]: ids.map(a => a.id)
        }
      }
    })
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allWriters
}
