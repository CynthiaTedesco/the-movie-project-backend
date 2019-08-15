//what I was planning to do:
// https://www.codementor.io/olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-and-postgresql-db-masuu56t7

//what I want to use instead:
// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

import Sequelize from 'sequelize';
import MovieModel from './models/movie';
import GenreModel from './models/genre';

const sequelize = new Sequelize('mp1', 'postgres', 'root', {
    host: 'localhost',
    port: 5433,
    dialect: 'postgres',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// MovieGenre will be our way of tracking relationship between Movie and Genre models
// each Movie can have multiple Genres and each Genre can belong to multiple movies
const Movie = MovieModel(sequelize, Sequelize);
const MovieGenre = sequelize.define('movie_genre', {});
const Genre = GenreModel(sequelize, Sequelize);

Movie.belongsToMany(Genre, { through: MovieGenre, unique: false });
Genre.belongsToMany(Movie, { through: MovieGenre, unique: false });
// Blog.belongsTo(Movie);


//sequelize.sync() will create all of the tables in the specified database. If you pass {force: true} as a parameter to sync method, it will remove tables on every startup and create new ones. Needless to say, this is a viable option only for development.
sequelize.sync({ force: true })
    .then(() => {
        console.log(`Database & tables created!`)
    });

module.exports = {
    Movie,
    Genre,
};
