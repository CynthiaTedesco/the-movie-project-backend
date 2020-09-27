const models = require("../../models");
const { movie_fields, updateJSON, getMergedMovie } = require("../helpers");
const { fetchFullMovieFromAPIS } = require("../services/movies");
const { updatePoster } = require("./Poster");
const { updateSerie } = require("./Serie");
const { updateCinematography } = require("./Cinematography");
const { updateDistributionCompany } = require("./DistributionCompany");
const { updateUniverse } = require("./Universe");
const { updateStoryOrigin } = require("./StoryOrigin");
const { updatePeopleDetails } = require("../routes/people");
const {
  updateGenres,
  updateRestrictions,
  updateProducers,
  updateCharacters,
  updateDirectors,
} = require("./Associations");

const fetchFullMovieFromDB = async (where) => {
  const movie = await models.movie.findOne({
    where: where,
    include: [
      { model: models.poster, as: "poster" },
      { model: models.universe, as: "universe" },
      { model: models.cinematography, as: "cinematography" },
      { model: models.serie, as: "serie" },
      { model: models.distribution_company, as: "distribution_company" },
      { model: models.story_origin, as: "story_origin" },
    ],
    attributes: movie_fields,
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

  return movie;
};

const asyncSwitch = (movie, updates) => {
  const noSingleFields = [
    "genres",
    "production_companies",
    "production_countries",
    "restrictions",
    "directors",
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
    { attr: "distribution_company", fn: updateDistributionCompany },
    { attr: "serie", fn: updateSerie },
  ];

  let updated = false;
  return new Promise((resolve) => {
    Object.entries(updates).forEach(async (entry, index, arr) => {
      if (toIgnore.indexOf(entry[0]) === -1) {
        if (entry[0] === "poster") {
          //TODO check what happens when we delete the poster
          const poster = await updatePoster(movie, updates.poster);
          if (poster.id) {
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
const updateLists = async (movie, updates) => {
  if (updates.genres) {
    await updateGenres(movie.dataValues, updates.genres);
  }
  if (updates.characters) {
    await updateCharacters(movie.dataValues, updates.characters);
  }
  if (updates.directors) {
    await updateDirectors(movie.dataValues, updates.directors);
  }
  if (updates.restrictions) {
    await updateRestrictions(movie.dataValues, updates.restrictions);
  }
  if (updates.producers) {
    await updateProducers(movie.dataValues, updates.producers);
  }
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

        updatePeopleDetails(updatedMovieFromDB);
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

async function autoUpdateMovieFn(id) {
  const movie_fromAPIS = await fetchFullMovieFromAPIS(id);
  const movie_fromDB = await fetchFullMovieFromDB(id);

  const updatedFields = getMergedMovie(
    movie_fromDB,
    movie_fromAPIS,
    "db",
    "api"
  );

  if (updatedFields && Object.keys(updatedFields).length) {
    return updateMovie(
      { imdb_id: movie_fromDB.imdb_id },
      updatedFields,
      movie_fromAPIS
    ).then(movie_fromDB=>{
      return { isUpdated: true, updatedMovie: movie_fromDB };
    });
  } else {
    return { isUpdated: false };
  }
}

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

module.exports.autoUpdateMovieFn = autoUpdateMovieFn;
module.exports.fetchFullMovieFromDB = fetchFullMovieFromDB;
module.exports.genres = genres;
module.exports.producers = producers;
module.exports.languages = languages;
module.exports.characters = characters;
module.exports.directors = directors;
module.exports.restrictions = restrictions;
module.exports.updateMovie = updateMovie;