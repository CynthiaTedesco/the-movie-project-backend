// const models = require('./models');
// const Op = models.Sequelize.Op;
import Sequelize from 'sequelize';
const Op = Sequelize.Op;

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
import moment from "moment";

export default async function populate(list, db){
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

    const genresModels = await persistGenres(list, Genre);
    const productions = await persistProductions(list, Production);
    const languages = await persistLanguages(list, Language);
    const movies = await persistMovies(list, Movie);

    list.forEach((e, i)=>{
        // if (e.genres && e.genres.length){
        //     e.genres.forEach(movieGenre => {
        //         const index = genresModels.findIndex(({dataValues}) => dataValues.name === movieGenre.name);
        //         if (index > -1){
        //             Movie.addGenre(genresModels[index]);
        //         }
        //     });
        //     console.log('first genre!');
        // }
    });
    // console.log('OP-------------------------------------------------------------------------------------------> ', Op);
}

async function persistGenres(movies, model){
    const genresToSave = getListWithoutDuplicates('genres', movies)
        .sort()
        .map(genre => {return {name: genre.name}});

    return model.bulkCreate(genresToSave,{ returning: true });
}
async function persistProductions(movies, model){
    const productionsToSave = getListWithoutDuplicates('production_companies', movies)
        .map(production => {return {name: production.name, country: production.origin_country}})
        .sort((a,b)=>{
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        });
    return model.bulkCreate(productionsToSave,{ returning: true });
}
async function persistLanguages(movies, model){
    const languagesToSave = [...new Set([].concat.apply([], movies.map(movie => movie["original_language"])))]
        .sort()
        .map(item => {return {code: item, name: item}});

    return model.bulkCreate(languagesToSave,{ returning: true });
}
async function persistMovies(movies, model){
    const moviesToSave = movies.map((movie, i) => {
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
    });

    return model.bulkCreate(moviesToSave,{ returning: true });
}

function getListWithoutDuplicates(key, list){
    let temp = [].concat.apply([], list.map(movie => movie[key]));

    return temp.filter((thing, index, self) => thing &&
        index === self.findIndex((t) => (t && t.id === thing.id && t.name === thing.name)));
}
