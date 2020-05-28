const models = require("../../models");

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

module.exports = {
  allProducers,
  allMoviesProducers,
};
