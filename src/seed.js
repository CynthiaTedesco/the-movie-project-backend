// const models = require('./models');
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

const Op = Sequelize.Op;

export default async function populate(list, db) {
    console.log('populating data. with e.g. ----> ', list[1]);

    const Movie = MovieModel(db, Sequelize);
    const Genre = GenreModel(db, Sequelize);
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

    await persistGenres(list, Genre);
    await persistProductions(list, Production);
    await persistLanguages(list, Language);

    const allGenres = await Genre.findAll();
    const allMovies = await Movie.findAll();
    const allLanguages = await Language.findAll();
    const allProducers = await Production.findAll();

    await Promise.all(
        list.map(async (e, i) => {
            const movieObj = movieDBObject(e);
            let dbMovie = allMovies
                .find(({dataValues}) => {
                    return dataValues.imdb_id === movieObj.imdb_id || dataValues.title === movieObj.title
                });

            if (dbMovie) {
                console.log('UPDATING:', e.id, e.imdb_id, e.title);
                const updatedResult = await Movie.update(movieObj, {
                    returning: true,
                    where: {
                        [Op.or]: [
                            e.imdb_id ? { imdb_id: e.imdb_id } : true,
                            { title: e.title }
                        ]
                    }
                });
                dbMovie = updatedResult[1][0];
            } else {
                console.log('CREATING:', e.id, e.imdb_id, e.title);
                dbMovie = await Movie.create(movieObj, {returning: true});
            }

            // movie associations
            setAssociations(e.genres, allGenres, dbMovie, MovieGenre, 'genre_id');
            setAssociations(e.production_companies, allProducers, dbMovie, MovieProduction, 'production_id');

            setMovieLanguageAssoc(e.original_language, allLanguages, dbMovie, MovieLanguage);
        })
    );
    // console.log('OP-------------------------------------------------------------------------------------------> ', Op);
}

function setMovieLanguageAssoc(language, dbAssociationsList, dbMovie, model){

        if (language){
            const index = dbAssociationsList.findIndex(({dataValues}) => dataValues.name === language);
            if (index > -1){
                let data = {};
                data['movie_id'] = dbMovie.dataValues.id;
                data['language_id'] = dbAssociationsList[index].dataValues.id;
                data['primary'] = true;

                model.upsert(data);
            }
        }
}

function setAssociations(toAssociateList, dbAssociationsList, dbMovie, model, assocKey){
    if (toAssociateList && toAssociateList.length){
        toAssociateList.forEach((assoc, i) => {
            const index = dbAssociationsList.findIndex(({dataValues}) => dataValues.name === assoc.name);
            if (index > -1){
                let data = {};
                data['movie_id'] = dbMovie.dataValues.id;
                data[assocKey] = dbAssociationsList[index].dataValues.id;;
                data['primary'] = i === 0;

                model.upsert(data);
            }
        });
    }
}

async function persistGenres(movies, model) {
    const genresToSave = getListWithoutDuplicates('genres', movies)
        .sort()
        .map(genre => {
            return {name: genre.name}
        });

    genresToSave.forEach(genre => model.upsert(genre));
}

async function persistProductions(movies, model) {
    getListWithoutDuplicates('production_companies', movies)
        .map(production => {
            return {name: production.name, country: production.origin_country}
        })
        .sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        }).forEach(production => model.upsert(production));
}

async function persistLanguages(movies, model) {
    [...new Set([].concat.apply([], movies.map(movie => movie["original_language"])))]
        .sort()
        .map(item => {
            return {code: item, name: item}
        })
        .forEach(language => model.upsert(language));
}

function movieDBObject(movie) {
    return {
        imdb_id: movie.imdb_id,
        title: movie.title,
        release_date: movie.release_date,
        length: movie.length,
        plot_line: movie.tagline,
        overview: movie.overview,
        unlikely: movie.unlikely,
        budget: movie.budget,
        website: movie.website,
        revenue: movie.revenue
    }
}

async function persistMovies(movies, model) {
    const moviesToSave = movies.map(movieDBObject);

    moviesToSave.forEach(movie => model.upsert(movie));
}

function getListWithoutDuplicates(key, list) {
    let temp = [].concat.apply([], list.map(movie => movie[key]));

    return temp.filter((thing, index, self) => thing &&
        index === self.findIndex((t) => (t && t.id === thing.id && t.name === thing.name)));
}
