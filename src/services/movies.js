import * as omdb from './omdb';
import {addSubsFileNames} from "../subs";

const fs = require('fs');
var subsrt = require('subsrt');

const movieQty = 200;

function successCB(data) {
    console.log("Success callback: ", data);
}

function errorCB(data) {
    console.log("Error callback: " + data);
}

export async function list(db) {
    // const theMovieDB_data = await themoviedb.data(movieQty, successCB, errorCB);
    // fs.writeFileSync('themoviedb_movies.json', JSON.stringify(theMovieDB_data, null, 2));

const data = fs.readFileSync('movies.json');
const theMovieDB_data = JSON.parse(data);

    // const Movie = MovieModel(db, Sequelize);
    // const localMovies = await Movie.findAll();

    const movies = theMovieDB_data || localMovies;

    const omdb_data = await
        omdb.data(movies, successCB, errorCB);

    //TODO look at theMovieDB restrictions
    //TODO add gender from theMovieDB

    const consolidatedAPIs = await Promise.all(movies.map(async lm => {
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
    }));
    // const moviesWithSubtitlesFiles = await addSubsFileNames(consolidatedAPIs);
    const moviesWithSubtitlesFiles = consolidatedAPIs;

    return moviesWithSubtitlesFiles.map(movie => {
        try {
            if (movie.subsFileName && fs.existsSync(movie.subsFileName)){
                const content = fs.readFileSync(movie.subsFileName, 'utf8');

                //Parse the content
                const captions = subsrt.parse(content, {});

                let wordsCount = 0;
                let words = [];

                captions.forEach(line=>{
                    const sanitizedLine = line.text
                        .replace(/<\/?[^>]+(>|$)/g, "") //removes html tags
                        .replace(/\r?\n|\r/g , " ") //removes new lines
                        .replace(/ *\([^)]*\) */g, ""); //removes parenthesis

                    const lineWords = sanitizedLine.split(' ');

                    wordsCount += lineWords.length;
                    lineWords.forEach(word=>{
                        let sanitizedWord = word
                            .replace(',','')
                            .replace('.','')
                            .replace('?','')
                            .replace('!','')
                            .toUpperCase();

                        if (words.findIndex(w=>w.sanitizedWord===sanitizedWord)>-1){
                            const wordArrayItem = words.find(w=>w.sanitizedWord===sanitizedWord);
                            wordArrayItem.count += 1;
                        } else {
                            words.push({word, count:1, sanitizedWord});
                        }
                    });
                });

                movie.word_count =  wordsCount;
                movie.most_used_word = words.sort((w1,w2)=>-w1.count+w2.count)[0].word;

                return movie;
            } else {
                return movie;
            }
        } catch(err) {
            console.error(err);
            return movie;
        }
    });
}
