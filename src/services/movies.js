const omdb = require("./omdb");
const themoviedb = require("./themoviedb");
const models = require("../../models");
const { getSubsFileName, processSubtitles } = require("../subs");
const { successCB, errorCB } = require("./common");
const { getNumber } = require("../helpers");
const populate = require("../seed").default;

const fs = require("fs");

const movieQty = 100;

let brandNew = [];

async function list(db) {
  const theMovieDB_data = await themoviedb.data(movieQty);
  fs.writeFileSync(
    "themoviedb_movies.json",
    JSON.stringify(theMovieDB_data, null, 2)
  );

  // const data = fs.readFileSync('movies.json')
  // const theMovieDB_data = JSON.parse(data)

  // const Movie = MovieModel(db, Sequelize);
  const localMovies = await Movie.findAll();

  const movies = theMovieDB_data || localMovies;

  const omdb_data = await omdb.data(movies, successCB, errorCB);

  //TODO look at theMovieDB restrictions --> it's called certifications and we could get them by adding &append_to_response=release_dates to the url
  //TODO add name of the language from omdb
  //TODO check where to get the producer country name //TODO get the country from omdb!!
  const consolidatedAPIs = await Promise.all(
    movies.map(async (lm) => {
      let movie = lm.dataValues ? lm.dataValues : lm;

      const omdb_movie = omdb_data.find((om) =>
        movie.imdb_id ? om.imdbID === movie.imdb_id : om.title === movie.title
      );
      if (omdb_movie) {
        movie.restrictions = [omdb_movie.Rated];
        movie.directors = omdb_movie.Director.split(", ");
        movie.writers = omdb_movie.Writer.split(", ");
        movie.actors = omdb_movie.Actors.split(", ");
        movie.awards = omdb_movie.Awards;
        movie.poster = omdb_movie.Poster;
        movie.imdb_rating = omdb_movie.imdbRating;
        movie.type = omdb_movie.Type;
        movie.box_office =
          omdb_movie.BoxOffice !== "N/A" ? getNumber(omdb_movie.BoxOffice) : "";
      }

      movie.subsFileName = await getSubsFileName(movie);

      return movie;
    })
  );

  return consolidatedAPIs.map(movie => processSubtitles(movie));
}
async function fetchFullMovieFromAPIS(id) {
  let tmdb;
  if (id.tmdb_id) {
    tmdb = await themoviedb.getMovieDetails({ id: id.tmdb_id });
  } else {
    tmdb = await themoviedb.getMovieDetails_byImdbId({
      imdb_id: id.imdb_id,
      external_source: "imdb_id",
    });
  }
  tmdb.tmdb_id = tmdb.id;
  delete tmdb.id;

  const omdb_ = tmdb.imdb_id ? await omdb.findByIMDB(tmdb.imdb_id) : null;
  let movie = tmdb;
  if (omdb_) {
    movie.restrictions = [omdb_.Rated];
    movie.directors = omdb_.Director.split(", ");
    movie.writers = omdb_.Writer.split(", ");
    movie.actors = omdb_.Actors.split(", ");
    movie.awards = omdb_.Awards;
    movie.poster = omdb_.Poster;
    movie.imdb_rating = omdb_.imdbRating;
    (movie.country = omdb_.Country), (movie.type = omdb_.Type);
    movie.box_office =
      omdb_.BoxOffice !== "N/A" ? getNumber(omdb_.BoxOffice) : "";
  }

  movie.valid = !(!movie.release_date || movie.vote_count < 1000);
  movie.subsFileName = await getSubsFileName(movie);
  const updatedMovie = await processSubtitles(movie);

  return updatedMovie;
}

async function updatedList() {
  const discovered = await themoviedb.discoverMovies(
    { quantity: movieQty },
    successCB,
    errorCB
  );
  const discoveredPromises = discovered.map((d) => {
    return themoviedb.getMovieDetails({ id: d.id }).then((r) => {
      if (!r.id) {
        return null;
      }
      return r;
    });
  });
  let tmdbResults = await Promise.all(discoveredPromises);
  tmdbResults = tmdbResults.filter((a) => a); //remove null values

  const fetchMoviesPromises = tmdbResults.map((tmdb_movie) => {
    return updateRevenue(tmdb_movie);
  });

  const done = await Promise.all(fetchMoviesPromises);

  const added = brandNew;
  brandNew = [];
  return { done, added };
}
/**
 * Updates the revenue of the given movie  or creates the movie if it does not exists
 * @param  movie
 */
function updateRevenue(movie) {
  return models.movie
    .findOne({ where: { imdb_id: movie.imdb_id } })
    .then((movieDB) => {
      if (movieDB) {
        if (movieDB.revenue !== movie.revenue) {
          movieDB.revenue = movie.revenue;
          return movieDB.save();
        }
        return movieDB;
      } else {
        brandNew.push(movie);
        fetchFullMovieFromAPIS({
          imdb_id: movie.imdb_id,
          tmdb_id: movie.id,
        }).then((fullMovie) => {
          populate([fullMovie], models.sequelize);
        });
      }
    });
}
module.exports = {
  fetchFullMovieFromAPIS,
  list,
  updatedList,
};
