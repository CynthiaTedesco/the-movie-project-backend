// const models = require('./models');
import Sequelize from 'sequelize';
import MovieModel from '../models/movie';
import GenreModel from '../models/genre';
import LanguageModel from '../models/language';
import ProducerModel from '../models/producer';
import RestrictionModel from '../models/restriction';
import PosterModel from '../models/poster';
import MovieTypeModel from '../models/movie_type';
import StoryOriginModel from '../models/story_origin'
import PersonModel from '../models/person';

import MovieGenreModel from '../models/movies_genres';
import MovieLanguageModel from '../models/movies_languages';
import MovieProducerModel from '../models/movies_producers';
import MovieRestrictionModel from '../models/movies_restrictions';
import MovieWriterModel from '../models/movies_writers';
import MovieCharacterModel from '../models/movies_characters';
import MovieDirectorModel from '../models/movies_directors';

const Op = Sequelize.Op;

export default async function populate(list, db) {
    console.log('populating data. with e.g. ----> ', list[1]);

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

    const allGenres = await Genre.findAll();
    const allMovies = await Movie.findAll();
    const allRestrictions = await Restriction.findAll();
    const allLanguages = await Language.findAll();
    const allProducers = await Producer.findAll();
    const allPeople = await Person.findAll();

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
            setAssociations(e.production_companies, allProducers, dbMovie, MovieProducer, 'producer_id');
            setAssociations(e.restrictions, allRestrictions, dbMovie, MovieRestriction, 'restriction_id');
            setPeopleAssociations(e, allPeople, dbMovie, {MovieWriter, MovieCharacter, MovieDirector}, 'person_id');

            //TODO here is being mess up!!! zh??? Every association is true!!!
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
        toAssociateList.filter(a=>a).forEach((assoc, i) => {
            const index = dbAssociationsList.findIndex(({dataValues}) => dataValues.name === assoc.name || assoc);
            if (index > -1){
                let data = {};
                data['movie_id'] = dbMovie.dataValues.id;
                data[assocKey] = dbAssociationsList[index].dataValues.id;
                data['primary'] = i === 0;

                model.upsert(data);
            }
        });
    }
}

function setPeopleAssociations(movie, dbPeopleList, dbMovie, models){
    //writers
    if (movie.writers && movie.writers.length){
        movie.writers.filter(a=>a).forEach(mw => {
            const writerName = mw.substring(0, mw.indexOf('(')>-1 ? mw.indexOf('(') : mw.length).trim();
            const writerDetail = mw.indexOf('(')>-1 ? mw.substring(mw.indexOf('('), mw.length).trim() : '';

            const index = dbPeopleList.findIndex(({dataValues}) => dataValues.name === writerName);
            if (index > -1){
                let data = {};
                data['movie_id'] = dbMovie.dataValues.id;
                data['person_id'] = dbPeopleList[index].dataValues.id;
                data['detail'] = writerDetail;

                models.MovieWriter.upsert(data);
            }
        })
    }

    //actors
    if (movie.actors && movie.actors.length){
        movie.actors.filter(a=>a).forEach((ma, i) => {
            const index = dbPeopleList.findIndex(({dataValues}) => dataValues.name === ma);
            if (index > -1){
                let data = {};
                data['movie_id'] = dbMovie.dataValues.id;
                data['person_id'] = dbPeopleList[index].dataValues.id;
                data['main'] = i === 0;

                models.MovieCharacter.upsert(data);
            }
        })
    }

    //directors
    if (movie.directors && movie.directors.length){
        movie.directors.filter(a=>a).forEach((md,i)=>{
            const directorName = md.substring(0, md.indexOf('(')>-1 ? md.indexOf('(') : md.length).trim();
            const directorDetail = md.indexOf('(')>-1 ? md.substring(md.indexOf('('), md.length).trim() : '';

            const index = dbPeopleList.findIndex(({dataValues}) => dataValues.name === directorName);
            if (index > -1){
                let data = {};
                data['movie_id'] = dbMovie.dataValues.id;
                data['person_id'] = dbPeopleList[index].dataValues.id;
                data['primary'] = i === 0;
                data['detail'] = directorDetail;

                models.MovieDirector.upsert(data);
            }
        })
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

async function persistProducers(movies, model) {
    getListWithoutDuplicates('production_companies', movies)
        .map(producer => {
            return {name: producer.name, country: producer.origin_country}
        })
        .sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        }).forEach(producer => model.upsert(producer));
}

async function persistLanguages(movies, model) {
    //TODO solve repeated values!
    [...new Set([].concat.apply([], movies.map(movie => movie["original_language"])))]
        .sort()
        .map(item => {
            return {code: item, name: item}
        })
        .forEach(language => model.upsert(language));
}

async function persistPeople(movies, model){
    // await persistWriters(movies, model);
    const writers = [].concat.apply([], movies.map(movie=> movie.writers));

    const writersNames = [...new Set(writers.map((w,i,list)=>{
        if (w){
            const opIndex = w.indexOf('(');
            const cpIndex = w.indexOf(')');
            if (opIndex){
                return w.substring(0, opIndex-1).trim();
            }

            if (cpIndex && !opIndex){
                list[i-1] = list[i-1] + w;
            }

            return w;
        }
    }))];

    const directors = [].concat.apply([], movies.map(movie=> movie.directors));
    const directorsNames = [...new Set(directors.map((d,i,list)=>{
        if (d){
            const opIndex = d.indexOf('(');
            const cpIndex = d.indexOf(')');
            if (opIndex){
                return d.substring(0, opIndex-1).trim();
            }

            if (cpIndex && !opIndex){
                list[i-1] = list[i-1] + d;
            }

            return d;
        }
    }))];
    const actors = [...new Set([].concat.apply([], movies.map(movie=> movie.actors)))];

    const people = [...new Set(writersNames.concat(directorsNames).concat(actors))].filter(a=>a);

    people
        .map(person => {return {name: person}}).sort()
        .forEach(person => model.upsert(person));
}

function persistRestrictions(movies, model){
    [...new Set([].concat.apply([], movies.map(movie => movie["restrictions"])))]
        .filter(a=>a)
        .sort()
        .map(item => {
            return {name: item}
        })
        .forEach(restriction => model.upsert(restriction));
}

function movieDBObject(movie) {
    return {
        imdb_id: movie.imdb_id,
        title: movie.title,
        release_date: movie.release_date,
        length: movie.length,
        plot_line: movie.tagline,
        overview: movie.overview,
        valid: movie.valid,
        budget: movie.budget,
        website: movie.website,
        revenue: movie.revenue,
        awards: movie.awards,
        box_offfice: movie.box_offfice,
        imdb_rating: movie.imdb_rating,
        rated: movie.rated
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
