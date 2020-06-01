const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const allProducers = (req, res) => {
  models.producer
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log);
};

const allMoviesProducers = (req, res) => {
  models.movies_producers
    .findAll()
    .then((results) => res.status(200).send(results))
    .catch(console.log);
};

const allProductionCountries = (req, res) => {
  models.producer
    .findAll({
      attributes: [
        [
          models.sequelize.fn("DISTINCT", models.sequelize.col("country")),
          "name",
        ],
      ],
      where: {
        country: {
          [Op.not]: null,
          [Op.not]: "",
        },
      },
    })
    .then((results) => res.status(200).send(results))
    .catch(console.log);
};
module.exports = {
  allProducers,
  allMoviesProducers,
  allProductionCountries,
};
