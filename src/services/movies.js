// import Movie from "../controllers/Movie";
import MovieModel from "../models/movie";
import Sequelize from "sequelize";

const movieQty = 200;

function successCB(data) {
    console.log("Success callback: ", data);
}

function errorCB(data) {
    console.log("Error callback: " + data);
}

export async function list(db) {
    // const theMovieDB_data = await themoviedb.data(movieQty, successCB, errorCB);

    const Movie = MovieModel(db, Sequelize);
    const localMovies = await Movie.findAll();

    const omdb_data = [];//await omdb.data(theMovieDB_data, successCB, errorCB);

    //TODO poster schema
    //TODO look at theMovieDB restrictions
    //TODO look for

    const consolidated = localMovies.map(lm => {
        let movie = lm.dataValues;
        const omdb_movie = omdb_data.find(om => movie.imdb_id ? om.imdbID === movie.imdb_id : om.title === movie.title);

        if (omdb_movie) {
            movie.type = omdb_movie.type;
            movie.rated = omdb_movie.rated;
            movie.director = omdb_movie.director;
            movie.writer = omdb_movie.writer;
            movie.actors = omdb_movie.actors;
            movie.awards = omdb_movie.awards;
            movie.poster = omdb_movie.poster;
            movie.imdbRating = omdb_movie.imdbRating;
            movie.boxOffice = omdb_movie.BoxOffice;
        }

        return movie;
    });

    return consolidated;
    // return .then(theMovieDB_data => {
    //     return theMovieDB_data;
    // });
}

