const models = require("../../models");
const {
  updateGenres,
  updateRestrictions,
  updateProducers,
  updateCharacters,
  updateDirectors,
  updateWriters,
  deleteRepeatedAssociations,
} = require("../controllers/Associations");
const { updatePoster } = require("../controllers/Poster");
const { updateSerie } = require("../controllers/Serie");
const { updateCinematography } = require("../controllers/Cinematography");
const { updateUniverse } = require("../controllers/Universe");
const { updateStoryOrigin } = require("../controllers/StoryOrigin");
const { fetchFullMovieFromAPIS, updateJSON } = require("../services/movies");
const { getMergedMovie } = require("../helpers");
const { updatePeopleDetails } = require("../routes/people");

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
    .update(
      { valid: models.sequelize.literal("NOT valid") },
      {
        where: {
          id: req.params.id,
        },
      }
    )
    .then(() => res.status(200).send("success"))
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Error trying to toggle validity");
    });
};
const fetchFullMovieFromDB = async (where) => {
  const movie = await models.movie.findOne({
    where: where,
    include: [
      { model: models.poster, as: "poster" },
      { model: models.universe, as: "universe" },
      { model: models.cinematography, as: "cinematography" },
      { model: models.serie, as: "serie" },
      { model: models.story_origin, as: "story_origin" },
      { model: models.movie_type, as: "type" },
      { model: models.place, as: "set_in_place" },
      { model: models.time, as: "set_in_time" },
    ],
  });

  const id = movie.id;
  const genresAssoc = await genres(id);
  movie.dataValues.genres = genresAssoc.dataValues.genres;

  const producersAssoc = await producers(id);
  movie.dataValues.producers = producersAssoc.dataValues.producers;

  const languagesAssoc = await languages(id);
  movie.dataValues.languages = languagesAssoc.dataValues.languages;

  const restrictionsAssoc = await restrictions(id);
  movie.dataValues.restrictions = restrictionsAssoc.dataValues.restrictions;

  const charactersAssoc = await characters(id);
  movie.dataValues.characters = charactersAssoc.dataValues.characters;

  const directorsAssoc = await directors(id);
  movie.dataValues.directors = directorsAssoc.dataValues.directors;

  const writtersAssoc = await writers(id);
  movie.dataValues.writers = writtersAssoc.dataValues.writers;

  return movie;
};
const fullMovie = async function(req, res) {
  fetchFullMovieFromDB({ id: req.params.id }).then((movie) => {
    res.status(200).send(movie);
  });
};

const genres = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.genre,
        as: "genres",
        required: false,
        attributes: ["id", "name"],
        through: {
          model: models["movies_genres"],
          as: "movies_genres",
          attributes: ["primary"],
        },
      },
    ],
  });
};
const producers = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.producer,
        as: "producers",
        required: false,
        attributes: ["id", "name", "country"],
        through: {
          model: models["movies_producers"],
          as: "movies_producers",
          attributes: ["primary"],
        },
      },
    ],
  });
};
const languages = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.language,
        as: "languages",
        required: false,
        attributes: ["id", "name", "code"],
        through: {
          model: models["movies_languages"],
          as: "movies_languages",
          attributes: ["primary"],
        },
      },
    ],
  });
};
const characters = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.person,
        as: "characters",
        required: false,
        attributes: ["id", "name", "date_of_birth", "gender"],
        through: {
          model: models["movies_characters"],
          as: "movies_characters",
          attributes: ["main", "character_name", "type"],
        },
      },
    ],
  });
};
const directors = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.person,
        as: "directors",
        required: false,
        attributes: ["id", "name", "date_of_birth", "gender"],
        through: {
          model: models["movies_directors"],
          as: "movies_directors",
          attributes: ["primary"],
        },
      },
    ],
  });
};
const writers = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.person,
        as: "writers",
        required: false,
        attributes: ["id", "name", "date_of_birth", "gender"],
        through: {
          model: models["movies_writers"],
          as: "movies_writers",
          attributes: ["primary", "detail"],
        },
      },
    ],
  });
};
const restrictions = (id) => {
  return models.movie.findOne({
    where: { id: id },
    attributes: ["id", "title"],
    include: [
      {
        model: models.restriction,
        as: "restrictions",
        required: false,
        attributes: ["id", "name", "country"],
        through: {
          model: models["movies_restrictions"],
          as: "movies_restrictions",
          attributes: ["primary"],
        },
      },
    ],
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
const movieWriters = function(req, res) {
  writers(req.params.id)
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
        { model: models.poster, as: "poster" },
        { model: models.universe, as: "universe" },
        { model: models.cinematography, as: "cinematography" },
        { model: models.serie, as: "serie" },
        { model: models.time, as: "set_in_time" },
        { model: models.place, as: "set_in_place" },
        { model: models.story_origin, as: "story_origin" },
      ],
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
          deleteRepeatedAssociations(
            "person_id",
            "movies_writers",
            movie.id,
            true
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
const updateMovie = (where, updates, dataFromAPIS) => {
  console.log("UPDATE MOVIE, updates", updates);
  return models.movie
    .findOne({
      where: where,
    })
    .then(async (movie) => {
      if (movie) {
        await updateSimpleFields(movie, updates, dataFromAPIS);
        await updateLists(movie, updates);

        const updatedMovieFromDB = await fetchFullMovieFromDB({ id: movie.id });

        await updatePeopleDetails(updatedMovieFromDB);
        updateJSON(updatedMovieFromDB, dataFromAPIS, updates);
        return updatedMovieFromDB;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const updateLists = async (movie, updates) => {
  if (updates.genres) {
    await updateGenres(movie.dataValues, updates.genres);
  }
  if (updates.characters) {
    await updateCharacters(movie.dataValues, updates.characters);
  }
  if (updates.directors) {
    console.log('----------- UPDATE DIRECTORS');
    await updateDirectors(movie.dataValues, updates.directors);
  }
  if (updates.writers) {
    await updateWriters(movie.dataValues, updates.writers);
  }
  if (updates.restrictions) {
    await updateRestrictions(movie.dataValues, updates.restrictions);
  }
  if (updates.producers) {
    await updateProducers(movie.dataValues, updates.producers);
  }
};
const updateSimpleField = (movie, update) => {
  const key = update[0];
  const value = update[1];
  if (value) {
    movie[key] = value;
    return true;
  } else {
    return false;
  }
};

const asyncSwitch = (movie, updates) => {
  const noSingleFields = [
    "genres",
    "production_companies",
    "production_countries",
    "restrictions",
    "directors",
    "writers",
    "actors",
  ];
  const toIgnore = [
    "original_language",
    "spoken_languages",
    "status",
    "subsFileName",
  ].concat(noSingleFields);

  const objectSingleFields = [
    { attr: "story_origin", fn: updateStoryOrigin },
    { attr: "universe", fn: updateUniverse },
    { attr: "cinematography", fn: updateCinematography },
    { attr: "serie", fn: updateSerie },
  ];

  let updated = false;
  return new Promise((resolve) => {
    Object.entries(updates).forEach(async (entry, index, arr) => {
      if (toIgnore.indexOf(entry[0]) === -1) {
        if (entry[0] === "poster") {
          //TODO check what happens when we delete the poster
          const poster = await updatePoster(movie, updates.poster);
          if (updates.poster.new && poster.id) {
            movie.poster_id = poster.id;
            updated = true;
          }
        } else if (
          objectSingleFields.findIndex((osf) => osf.attr === entry[0]) > -1
        ) {
          const objectField = objectSingleFields.find(
            (osf) => osf.attr === entry[0]
          );
          const attrId = `${entry[0]}_id`;

          if (!updates[entry[0]]) {
            //it has been deleted!
            movie[attrId] = null;
            updated = true;
          } else {
            const obj = await objectField.fn(movie, updates[entry[0]]);
            if (movie[attrId] !== obj.id) {
              movie[attrId] = obj.id;
              updated = true;
            }
          }
        } else {
          const hasBeenUpdated = updateSimpleField(movie, entry);
          updated = updated || hasBeenUpdated;
        }
      }

      if (index + 1 === arr.length) {
        return resolve(updated);
      }
    });
  });
};
const updateSimpleFields = async (movie, updates, fullMovie) => {
  const updated = await asyncSwitch(movie, updates);

  //TODO check if tmdb_id is being updated even with this lines commented
  // if (fullMovie && fullMovie.tmdb_id && !movie.tmdb_id) {
  //   movie.tmdb_id = fullMovie.tmdb_id
  // }
  if (updated) {
    return movie.save();
  }

  return movie;
};
const autoUpdateMovieFn = async (id) => {
  const movie_fromAPIS = await fetchFullMovieFromAPIS(id);
  const movie_fromDB = await fetchFullMovieFromDB(id);
  const updatedFields = getMergedMovie(
      movie_fromDB,
      movie_fromAPIS,
      "db",
      "api"
    );
  if (updatedFields && Object.keys(updatedFields).length) {
    await updateMovie(
      { imdb_id: movie_fromDB.imdb_id },
      updatedFields,
      movie_fromAPIS
    );

    return { updated: true, movie_fromAPIS };
  } else {
    return { updated: false, movie_fromAPIS };
  }
};
const autoUpdateAll = async (req, res) => {
  models.movie.findAll({ attributes: ["id"], raw: true }).then(async (movies) => {
    await Promise.all(movies.map(movie=>{
      const id = {id: movie.id};
      return autoUpdateMovieFn(id);
    }))

    res
        .status(200)
        .send({ message: "Successful autoupdate" });
  });
  res.status(200);
};
const autoUpdateMovie = (req, res) => {
  const id = req.body.tmdb_id
    ? { tmdb_id: req.body.tmdb_id }
    : { imdb_id: req.body.imdb_id };

  autoUpdateMovieFn(id).then(({ updated, movie_fromAPIS }) => {
    if (updated) {
      res
        .status(200)
        .send({ message: "Successful autoupdate", updated: movie_fromAPIS });
    } else {
      res
        .status(200)
        .send({ message: "Nothing to update", updated: movie_fromAPIS });
    }
  });
};
const updateRevenues = async (req, res) => {};
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
  movieWriters,
  deleteMovie,
  deleteAllRepeatedAssociations,
  updateMovieEndpoint,
  autoUpdateMovie,
  autoUpdateAll,
  updateRevenues,
  bulkUpdate,
};
