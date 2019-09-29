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
import StoryOriginModel from './models/storyOrigin'
import CharacterModel from './models/character';

import MovieGenreModel from './models/movieGenre';
import MovieLanguageModel from './models/movieLanguage';
import MovieProductionModel from './models/movieProduction';
import MovieRestrictionModel from './models/movieRestrictions';
import {connectDB, disconnectDB} from "./connection";

const db = new Sequelize('mp1', 'postgres', 'root', {
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
export const Movie = MovieModel(db, Sequelize);
export const Genre = GenreModel(db, Sequelize);
const Language = LanguageModel(db, Sequelize);
const Production = ProductionModel(db, Sequelize);
const Restriction = RestrictionModel(db, Sequelize);
const Poster = PosterModel(db, Sequelize);
const PosterType = PosterTypeModel(db, Sequelize);
const StoryOrigin = StoryOriginModel(db, Sequelize);
const Character = CharacterModel(db, Sequelize);

const MovieGenre = MovieGenreModel(db, Sequelize);
const MovieLanguage = MovieLanguageModel(db, Sequelize);
const MovieProduction = MovieProductionModel(db, Sequelize);
const MovieRestriction = MovieRestrictionModel(db, Sequelize);

Movie.belongsToMany(Genre, {through: MovieGenre, unique: false});
Genre.belongsToMany(Movie, {through: MovieGenre, unique: false});

Movie.belongsToMany(Language, {through: MovieLanguage});
Language.belongsToMany(Movie, {through: MovieLanguage});

Movie.belongsToMany(Production, {through: MovieProduction});
Production.belongsToMany(Movie, {through: MovieProduction});

Movie.belongsToMany(Restriction, {through: MovieRestriction});
Restriction.belongsToMany(Movie, {through: MovieRestriction});

PosterType.hasOne(Poster);
Poster.hasOne(Movie, {underscored: true});
StoryOrigin.hasOne(Movie);
Character.hasOne(Movie, {as: 'main_character'});

export async function syncModels() {
    await connectDB();

    console.log('Synchronizing...');
    //db.sync() will create all of the tables in the specified database.
    // If you pass {force: true} , it will drop tables on every startup and create new ones.
    // Needless to say, this is a viable option only for development.
    db.sync({force: false})
        .then(() => {
            console.log('Tables have synced!');
        });
}

export async function closeConnection() {
    await disconnectDB();
}
