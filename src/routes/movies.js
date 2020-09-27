const models = require("../../models");
const { deleteRepeatedAssociations } = require("../controllers/Associations");
const {
  fetchFullMovieFromDB,
  genres,
  producers,
  languages,
  characters,
  directors,
  restrictions,
  autoUpdateMovieFn,
  updateMovie,
} = require("../controllers/Movie");
const { updatedList } = require("../services/movies");
const { movie_fields } = require("../helpers");

const bulkUpdate = async function(req, res) {
  let updatedMovies = [];
  await Promise.all(
    Object.entries(req.body).map(async (entry) => {
      const movieId = entry[0];
      const changes = entry[1];
      if (movieId) {
        updatedMovies.push(await updateMovie({ id: movieId }, changes));
      }
    })
  );

  return res.status(200).send({ message: "Successful update", updatedMovies });
};

const toggleValidity = async function(req, res) {
  await models["movie"]
    .findOne({
      where: { id: req.params.id },
    })
    .then((movie) => {
      const wasValid = movie.valid;
      movie.valid = wasValid === null ? true : !wasValid;
      movie.save();
    })
    .then(() => res.status(200).send("success"))
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Error trying to toggle validity");
    });
};

const fullMovie = async function(req, res) {
  fetchFullMovieFromDB({ id: req.params.id }).then((movie) => {
    res.status(200).send(movie);
  });
};

const movieGenres = function(req, res) {
  genres(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log);
};
const movieRestrictions = function(req, res) {
  restrictions(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log);
};
const movieDirectors = function(req, res) {
  directors(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log);
};
const movieCharacters = function(req, res) {
  characters(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log);
};
const movieProducers = function(req, res) {
  producers(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log);
};
const movieLanguages = function(req, res) {
  languages(req.params.id)
    .then((movie) => res.status(200).send(movie))
    .catch(console.log);
};

const allMovies = (req, res) => {
  models.movie
    .findAll({
      include: [
        {
          model: models.poster,
          as: "poster",
          include: [
            {
              model: models.poster_type,
              as: "poster_type",
            },
          ],
        },
        { model: models.universe, as: "universe" },
        { model: models.cinematography, as: "cinematography" },
        { model: models.serie, as: "serie" },
        { model: models.distribution_company, as: "distribution_company" },
        { model: models.story_origin, as: "story_origin" },
      ],
      attributes: movie_fields,
    })
    .then((movies) => res.status(200).send(movies))
    .catch(console.log);
};

const deleteMovie = (req, res) => {
  models.movie
    .update({ deletedAt: new Date() }, { where: { id: req.params.id } })
    .then(() => res.status(200).send("Successful delete"))
    .catch(console.log);
};

const deleteAllRepeatedAssociations = (req, res) => {
  models.movie
    .findAll()
    .then((movies) => {
      movies.forEach(async (movie) => {
        const promises = [
          deleteRepeatedAssociations("genre_id", "movies_genres", movie.id),
          deleteRepeatedAssociations(
            "language_id",
            "movies_languages",
            movie.id
          ),
          deleteRepeatedAssociations(
            "restriction_id",
            "movies_restrictions",
            movie.id
          ),
          deleteRepeatedAssociations(
            "producer_id",
            "movies_producers",
            movie.id
          ),
          deleteRepeatedAssociations("person_id", "movies_directors", movie.id),
          deleteRepeatedAssociations(
            "person_id",
            "movies_characters",
            movie.id,
            "characters"
          ),
        ];
        return Promise.all(promises);
      });
    })
    .then(() => {
      return res
        .status(200)
        .send({ message: "Successfully deleted all duplicated" });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .send({ message: "Error while deleting repeated associations", err });
    });
};

const updateMovieEndpoint = (req, res) => {
  return updateMovie({ id: req.params.id }, req.body)
    .then((updated) => {
      if (updated) {
        return res
          .status(200)
          .send({ message: "Successful autoupdate", updated: updated });
      } else {
        res.status(204).send({
          message: `No content to update requested movie: ${req.params.id}`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .send(`Error trying to update movie: ${req.params.id}`);
    });
};

const autoUpdateAll = async (req, res) => {
  return models.movie
    .findAll({ attributes: ["imdb_id"], raw: true })
    .then(async (movies) => {
      await Promise.all(
        movies.map((movie) => {
          const id = { imdb_id: movie.imdb_id };
          return autoUpdateMovieFn(id);
        })
      );

      res.status(200).send({ message: "Successful autoupdate" });
    })
    .error((e) => {
      res.status(500).send({ message: "Error while trying autoUpdateAll", e });
    });
};
const autoUpdateMovie = (req, res) => {
  const id = req.body.tmdb_id
    ? { tmdb_id: req.body.tmdb_id }
    : { imdb_id: req.body.imdb_id };

  autoUpdateMovieFn(id).then(({ isUpdated, updatedMovie }) => {
    if (isUpdated) {
      res
        .status(200)
        .send({ message: "Successful autoupdate", updated: updatedMovie });
    } else {
      res
        .status(200)
        .send({ message: "Nothing to update", updated: false});
    }
  });
};
const updateRevenues = async (req, res) => {
  const ul = await updatedList();
  res.status(200).send({ message: "Successful revenues update", results: ul });
};
module.exports = {
  toggleValidity,
  fullMovie,
  allMovies,
  movieGenres,
  movieRestrictions,
  movieCharacters,
  movieDirectors,
  movieLanguages,
  movieProducers,
  deleteMovie,
  deleteAllRepeatedAssociations,
  updateMovieEndpoint,
  autoUpdateMovie,
  autoUpdateAll,
  updateRevenues,
  bulkUpdate,
};
