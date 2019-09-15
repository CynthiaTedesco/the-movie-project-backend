//what I was planning to do:
// https://www.codementor.io/olawalealadeusi896/building-a-simple-api-with-nodejs-expressjs-and-postgresql-db-masuu56t7

//what I want to use instead:
// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

import Sequelize from 'sequelize';
import MovieModel from './models/movie';
import GenreModel from './models/genre';
import LanguageModel from './models/language';
import ProductionModel from './models/production';
import RestrictionModel from './models/restriction';
import PosterModel from './models/poster';
import PosterTypeModel from './models/posterType';

import MovieLanguageModel from './models/movieLanguage';
import MovieProductionModel from './models/movieProduction';
import MovieRestrictionModel from './models/movieRestrictions';

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
const Genre = GenreModel(sequelize, Sequelize);
const Language = LanguageModel(sequelize, Sequelize);
const Production = ProductionModel(sequelize, Sequelize);
const Restriction = RestrictionModel(sequelize, Sequelize);
const Poster = PosterModel(sequelize, Sequelize);
const PosterType = PosterTypeModel(sequelize, Sequelize);

const MovieGenre = sequelize.define('movie_genre', {});
const MovieLanguage = MovieLanguageModel(sequelize, Sequelize);
const MovieProduction = MovieProductionModel(sequelize, Sequelize);
const MovieRestriction = MovieRestrictionModel(sequelize, Sequelize);

Movie.belongsToMany(Genre, { through: MovieGenre, unique: false });
Genre.belongsToMany(Movie, { through: MovieGenre, unique: false });

Movie.belongsToMany(Language, {through: MovieLanguage});
Language.belongsToMany(Movie, {through: MovieLanguage});

Movie.belongsToMany(Production, {through: MovieProduction});
Production.belongsToMany(Movie, {through: MovieProduction});

Movie.belongsToMany(Restriction, {through: MovieRestriction});
Restriction.belongsToMany(Movie, {through: MovieRestriction});

PosterType.hasOne(Poster);
Poster.hasOne(Movie, {underscored: true});

//sequelize.sync() will create all of the tables in the specified database. If you pass {force: true} as a parameter to sync method, it will remove tables on every startup and create new ones. Needless to say, this is a viable option only for development.
sequelize.sync({ force: true })
    .then(() => {
        console.log(`Database & tables created!`)
    });

module.exports = {
    Movie,
    Genre,
};
