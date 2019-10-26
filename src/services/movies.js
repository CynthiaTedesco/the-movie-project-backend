import * as themoviedb from './themoviedb';
import * as omdb from './omdb';
import MovieModel from "../../models/movie";
import Sequelize from "sequelize";
const fs = require('fs');

const movieQty = 200;

function successCB(data) {
    console.log("Success callback: ", data);
}

function errorCB(data) {
    console.log("Error callback: " + data);
}

export async function list(db) {
    // const theMovieDB_data = await themoviedb.data(movieQty, successCB, errorCB);
    // fs.writeFileSync('./movies.json', JSON.stringify(theMovieDB_data));

const data = fs.readFileSync('movies.json');
const theMovieDB_data = JSON.parse(data);

    // const Movie = MovieModel(db, Sequelize);
    // const localMovies = await Movie.findAll();

    const movies = theMovieDB_data || localMovies;

    const omdb_data = await
        omdb.data(movies, successCB, errorCB);

    //TODO look at theMovieDB restrictions

    const consolidated = movies.map(lm => {
        let movie = lm.dataValues ? lm.dataValues : lm;
        const omdb_movie = omdb_data.find(om => movie.imdb_id ? om.imdbID === movie.imdb_id : om.title === movie.title);

        if (omdb_movie) {
            movie.restrictions = [omdb_movie.Rated];
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

