import * as themoviedb from './themoviedb';
import * as omdb from './omdb';
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

    const omdb_data = await
        omdb.data(localMovies, successCB, errorCB);

    //TODO poster schema
    //TODO look at theMovieDB restrictions
    //TODO create writers schemas (manyToMany) and same for directors

    const consolidated = localMovies.map(lm => {
        let movie = lm.dataValues;
        const omdb_movie = omdb_data.find(om => movie.imdb_id ? om.imdbID === movie.imdb_id : om.title === movie.title);

        if (omdb_movie) {
            movie.restrictions =[].push(omdb_movie.Rated);
            movie.directors = omdb_movie.Director.split(', ');
            movie.writers = omdb_movie.Writer.split(', ');
            movie.actors = omdb_movie.Actors.split(', ');
            movie.awards = omdb_movie.Awards;
            movie.poster = omdb_movie.Poster;
            movie.imdb_rating = omdb_movie.imdbRating;
            movie.type = omdb_movie.Type;
            movie.box_offfice = omdb_movie.BoxOffice !== 'N/A' ? omdb_movie.BoxOffice : '';
        }

        return movie;
    });

    return consolidated;
}

