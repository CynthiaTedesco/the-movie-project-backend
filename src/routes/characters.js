const models = require('../../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const allCharacters = async (req, res) => {
  const ids = await models.movies_characters.findAll({
    attributes: ['id'],
    raw:true
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

const allCharacterTypes = (req, res) => {
  models.character_type
    .findAll()
    .then(results => res.status(200).send(results))
    .catch(console.log)
}

module.exports = {
  allCharacters,
  allCharacterTypes
}
