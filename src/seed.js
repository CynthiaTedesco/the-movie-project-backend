// const models = require('./models');
const Sequelize = require("sequelize");
const MovieModel = require("../models/movie");
const GenreModel = require("../models/genre");
const LanguageModel = require("../models/language");
const ProducerModel = require("../models/producer");
const RestrictionModel = require("../models/restriction");
const PosterModel = require("../models/poster");
const MovieTypeModel = require("../models/movie_type");
const StoryOriginModel = require("../models/story_origin");
const PersonModel = require("../models/person");

const MovieGenreModel = require("../models/movies_genres");
const MovieLanguageModel = require("../models/movies_languages");
const MovieProducerModel = require("../models/movies_producers");
const MovieRestrictionModel = require("../models/movies_restrictions");
const MovieWriterModel = require("../models/movies_writers");
const MovieCharacterModel = require("../models/movies_characters");
const MovieDirectorModel = require("../models/movies_directors");

const fs = require("fs");

const Op = Sequelize.Op;

module.exports = async function populate(list, db) {
  const Movie = MovieModel(db, Sequelize);
  const Genre = GenreModel(db, Sequelize);
  const Language = LanguageModel(db, Sequelize);
  const Producer = ProducerModel(db, Sequelize);
  const Restriction = RestrictionModel(db, Sequelize);
  const Poster = PosterModel(db, Sequelize);
  const MovieType = MovieTypeModel(db, Sequelize);
  const StoryOrigin = StoryOriginModel(db, Sequelize);
  const Person = PersonModel(db, Sequelize);

  const MovieGenre = MovieGenreModel(db, Sequelize);
  const MovieLanguage = MovieLanguageModel(db, Sequelize);
  const MovieProducer = MovieProducerModel(db, Sequelize);
  const MovieRestriction = MovieRestrictionModel(db, Sequelize);
  const MovieCharacter = MovieCharacterModel(db, Sequelize);
  const MovieWriter = MovieWriterModel(db, Sequelize);
  const MovieDirector = MovieDirectorModel(db, Sequelize);

  await persistGenres(list, Genre);
  await persistProducers(list, Producer);
  await persistLanguages(list, Language);
  await persistPeople(list, Person);
  await persistRestrictions(list, Restriction);
  await persistPosters(list, Poster);

  const allPosters = await Poster.findAll();
  const allGenres = await Genre.findAll();
  const allMovies = await Movie.findAll();
  const allRestrictions = await Restriction.findAll();
  const allLanguages = await Language.findAll();
  const allProducers = await Producer.findAll();
  const allPeople = await Person.findAll();

  await Promise.all(
    list.map(async (e, i) => {
      const movieObj = movieDBObject(e, allPosters);
      let dbMovie = allMovies.find(({ dataValues }) => {
        return (
          dataValues.imdb_id === movieObj.imdb_id ||
          dataValues.title === movieObj.title
        );
      });

      if (dbMovie) {
        console.log("UPDATING:", e.id, e.imdb_id, e.title);
        const updatedResult = await Movie.update(movieObj, {
          returning: true,
          where: {
            [Op.or]: [
              e.imdb_id ? { imdb_id: e.imdb_id } : true,
              { title: e.title },
            ],
          },
        });
        dbMovie = updatedResult[1][0];
      } else {
        console.log("CREATING:", e.id, e.imdb_id, e.title);
        dbMovie = await Movie.create(movieObj, { returning: true });
      }

      // movie associations
      setAssociations(e.genres, allGenres, dbMovie, MovieGenre, 'genre_id');
      setAssociations(e.production_companies, allProducers, dbMovie, MovieProducer, 'producer_id');
      setAssociations(e.restrictions, allRestrictions, dbMovie, MovieRestriction, 'restriction_id');
      setPeopleAssociations(e, allPeople, dbMovie, {MovieWriter, MovieCharacter, MovieDirector}, 'person_id');
      setMovieLanguageAssociations(e.original_language, allLanguages, dbMovie, MovieLanguage);

    })
  );
}

function setMovieLanguageAssociations(
  language,
  dbAssociationsList,
  dbMovie,
  model
) {
  if (language) {
    const index = dbAssociationsList.findIndex(
      ({ dataValues }) => dataValues.name === language
    );
    if (index > -1) {
      let data = {};
      data["movie_id"] = dbMovie.dataValues.id;
      data["language_id"] = dbAssociationsList[index].dataValues.id;
      data["primary"] = true;

      model.upsert(data);
    }
  }
}

function setAssociations(
  toAssociateList,
  dbAssociationsList,
  dbMovie,
  model,
  assocKey
) {
  if (toAssociateList && toAssociateList.length) {
    toAssociateList
      .filter((a) => a)
      .forEach((assoc, i) => {
        const index = dbAssociationsList.findIndex(
          ({ dataValues }) => dataValues.name === assoc.name
        );
        if (index > -1) {
          let data = {};
          data["movie_id"] = dbMovie.dataValues.id;
          data[assocKey] = dbAssociationsList[index].dataValues.id;
          data["primary"] = i === 0;

          model.upsert(data);
        }
      });
  }
}

function setPeopleAssociations(movie, dbPeopleList, dbMovie, models) {
  //writers
  //TODO remove duplicates
  //TODO check that it does not persist duplicates
  if (movie.writers && movie.writers.length) {
    movie.writers
      .filter((a) => a)
      .forEach((mw) => {
        const writerName = mw
          .substring(0, mw.indexOf("(") > -1 ? mw.indexOf("(") : mw.length)
          .trim();
        const writerDetail =
          mw.indexOf("(") > -1
            ? mw.substring(mw.indexOf("("), mw.length).trim()
            : "";

        const index = dbPeopleList.findIndex(
          ({ dataValues }) => dataValues.name === writerName
        );
        if (index > -1) {
          let data = {};
          data["movie_id"] = dbMovie.dataValues.id;
          data["person_id"] = dbPeopleList[index].dataValues.id;
          data["detail"] = writerDetail;

          models.MovieWriter.upsert(data);
        }
      });
  }

  //actors
  //TODO check duplicates!
  if (movie.actors && movie.actors.length) {
    movie.actors
      .filter((a) => a)
      .forEach((ma, i) => {
        const index = dbPeopleList.findIndex(
          ({ dataValues }) => dataValues.name === ma
        );
        if (index > -1) {
          let data = {};
          data["movie_id"] = dbMovie.dataValues.id;
          data["person_id"] = dbPeopleList[index].dataValues.id;
          data["main"] = i === 0;

          models.MovieCharacter.upsert(data);
        }
      });
  }

  //directors
  //TODO check why firsts movies directors are missing
  if (movie.directors && movie.directors.length) {
    movie.directors
      .filter((a) => a)
      .forEach((md, i) => {
        const directorName = md
          .substring(0, md.indexOf("(") > -1 ? md.indexOf("(") : md.length)
          .trim();
        const directorDetail =
          md.indexOf("(") > -1
            ? md.substring(md.indexOf("("), md.length).trim()
            : "";

        const index = dbPeopleList.findIndex(
          ({ dataValues }) => dataValues.name === directorName
        );
        if (index > -1) {
          let data = {};
          data["movie_id"] = dbMovie.dataValues.id;
          data["person_id"] = dbPeopleList[index].dataValues.id;
          data["primary"] = i === 0;
          data["detail"] = directorDetail;

          models.MovieDirector.upsert(data);
        }
      });
  }
}

async function persistGenres(movies, model) {
  const genresToSave = getListWithoutDuplicates("genres", movies)
    .sort()
    .map((genre) => {
      return { name: genre.name };
    });

  genresToSave.forEach((genre) => {
      return model.upsert(genre);
    });
}

async function persistProducers(movies, model) {
  const producersArray = movies.map((m) => {
    const production_countries = m["production_countries"] || [];
    return (m["production_companies"] || []).map((pc) => {
      return {
        name: pc.name,
        country:
          pc.origin_country ||
          (production_countries.length === 1
            ? production_countries[0].iso_3166_1
            : ""),
      };
    });
  });
  const producers = [].concat.apply([], producersArray);
  const unrepeated = producers.filter(
    (thing, index, self) =>
      thing && index === self.findIndex((t) => t.name === thing.name)
  );

  unrepeated
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    })
    .forEach((producer) => {
      return model.upsert(producer);
    });
}

async function persistLanguages(movies, model) {
  const unrepeated = [
    ...new Set(
      [].concat.apply(
        [],
        movies.map((movie) => movie["original_language"])
      )
    ),
  ];

  unrepeated
    .sort()
    .map((item) => {
      return { code: item, name: item }; //TODO get the name of the language from omdb
    })
    .forEach((language) => {
        return model.findOrCreate({
            where: {code:language.code},
            defaults: language
        });
    });
}

async function persistPosters(movies, model) {
  movies
    .map((movie) => movie["poster"])
    .filter((a) => a)
    .sort()
    .map((item) => {
      return { url: item };
    })
    .forEach((poster) => {
        return model.upsert(poster);
      });
}

async function persistPeople(movies, model) {
  const writers = [].concat.apply(
    [],
    movies.map((movie) => movie.writers)
  );

  const writersNames = [
    ...new Set(
      writers.map((w, i, list) => {
        if (w) {
          const opIndex = w.indexOf("(");
          const cpIndex = w.indexOf(")");
          if (opIndex) {
            return w.substring(0, opIndex - 1).trim();
          }

          if (cpIndex && !opIndex) {
            list[i - 1] = list[i - 1] + w;
          }

          return w;
        }
      })
    ),
  ];

  const directors = [].concat.apply(
    [],
    movies.map((movie) => movie.directors)
  );
  const directorsNames = [
    ...new Set(
      directors.map((d, i, list) => {
        if (d) {
          const opIndex = d.indexOf("(");
          const cpIndex = d.indexOf(")");
          if (opIndex) {
            return d.substring(0, opIndex - 1).trim();
          }

          if (cpIndex && !opIndex) {
            list[i - 1] = list[i - 1] + d;
          }

          return d;
        }
      })
    ),
  ];
  const actors = [
    ...new Set(
      [].concat.apply(
        [],
        movies.map((movie) => movie.actors)
      )
    ),
  ];

  const people = [
    ...new Set(writersNames.concat(directorsNames).concat(actors)),
  ].filter((a) => a);

  people
    .map((person) => {
      return { name: person };
    })
    .sort()
    .forEach((person) => {
      return model.upsert(person);
    });
}

function persistRestrictions(movies, model) {
  [
    ...new Set(
      [].concat.apply(
        [],
        movies.map((movie) => movie["restrictions"])
      )
    ),
  ]
    .filter((a) => a)
    .sort()
    .map((item) => {
      return { name: item };
    })
    .forEach((restriction) => {
      return model.upsert(restriction);
    });
}

function movieDBObject(movie, dbPosters) {
  if (movie.poster) {
    const posterIndex = dbPosters.findIndex(
      ({ dataValues }) => dataValues.url === movie.poster
    );
    movie.poster = dbPosters[posterIndex]
      ? dbPosters[posterIndex].dataValues.id
      : null;
  }

  if(movie.subsFileName && fs.existsSync(movie.subsFileName)) {
    movie.subtitles = fs.readFileSync(movie.subsFileName);
  }

  return {
    imdb_id: movie.imdb_id,
    title: movie.title,
    release_date: movie.release_date,
    length: movie.runtime,
    plot_line: movie.tagline,
    overview: movie.overview,
    valid: movie.valid,
    budget: movie.budget,
    website: movie.website,
    revenue: movie.revenue,
    awards: movie.awards,
    box_office: movie.box_office || null,
    imdb_rating: movie.imdb_rating,
    rated: movie.rated,
    poster_id: movie.poster,
    subtitles: movie.subtitles
  };
}

function getListWithoutDuplicates(key, list) {
  let temp = [].concat.apply(
    [],
    list.map((movie) => movie[key])
  );

  return temp.filter(
    (thing, index, self) =>
      thing &&
      index ===
        self.findIndex((t) => t && t.id === thing.id && t.name === thing.name)
  );
}
