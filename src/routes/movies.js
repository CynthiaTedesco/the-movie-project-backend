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
      console.log(err)
      return res.status(500).send('Error trying to toggle validity')
    })
}

//TODO fix performance. Split?
const fullMovie = function(req, res) {
  models.movie
    .findOne({
      where: { id: req.params.id },
      include: [
        { model: models.poster, as: 'poster' },
        { model: models.story_origin, as: 'story_origin' },
        { model: models.movie_type, as: 'type' },
        { model: models.place, as: 'set_in_place' },
        { model: models.time, as: 'set_in_time' },
        {
          model: models.genre,
          as: 'genres',
          required: false,
          attributes: ['id', 'name'],
          through: {
            model: models['movies_genres'],
            as: 'movies_genres',
            attributes: ['primary']
          }
        },
        {
          model: models.person,
          as: 'writers',
          required: false,
          attributes: ['id', 'name', 'date_of_birth', 'gender'],
          through: {
            model: models['movies_writers'],
            as: 'movies_writers',
            attributes: ['primary', 'detail']
          }
        },
        {
          model: models.person,
          as: 'characters',
          required: false,
          attributes: ['id', 'name', 'date_of_birth', 'gender'],
          through: {
            model: models['movies_characters'],
            as: 'movies_characters',
            attributes: ['main', 'character_name', 'type']
          }
        },
        {
          model: models.person,
          as: 'directors',
          required: false,
          attributes: ['id', 'name', 'date_of_birth', 'gender'],
          through: {
            model: models['movies_directors'],
            as: 'movies_directors',
            attributes: ['primary']
          }
        },
        {
          model: models.language,
          as: 'languages',
          required: false,
          attributes: ['id', 'name', 'code'],
          through: {
            model: models['movies_languages'],
            as: 'movies_languages',
            attributes: ['primary']
          }
        },
        {
          model: models.producer,
          as: 'producers',
          required: false,
          attributes: ['id', 'name', 'country'],
          through: {
            model: models['movies_producers'],
            as: 'movies_producers',
            attributes: ['primary']
          }
        },
        {
          model: models.restriction,
          as: 'restrictions',
          required: false,
          attributes: ['id', 'name', 'country'],
          through: {
            model: models['movies_restrictions'],
            as: 'movies_restrictions',
            attributes: ['primary']
          }
        }
      ]
    })
    .then(movie => res.status(200).send(movie))
    .catch(console.log)
}

const allMovies = (req, res) => {
  models.movie
    .findAll({
      include: [{ model: models.poster, as: 'poster' }]
    })
    .then(movies => res.status(200).send(movies))
    .catch(console.log)
}

module.exports = {
  toggleValidity,
  fullMovie,
  allMovies
}
