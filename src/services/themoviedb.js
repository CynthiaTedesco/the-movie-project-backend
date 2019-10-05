import axios from 'axios';
import 'dotenv/config';

//https://github.com/cavestri/themoviedb-javascript-library/wiki

let theMovieDb = {};

theMovieDb.common = {
    api_key: process.env.THE_MOVIE_DB_API_KEY,
    base_uri: "http://api.themoviedb.org/3/",
    images_uri: "http://image.tmdb.org/t/p/",
    timeout: 2000,
    language: "en-US",
    generateQuery: function (options) {
        'use strict';
        var myOptions, query, option;

        myOptions = options || {};
        // query = "?api_key=" + theMovieDb.common.api_key + "&language=" + theMovieDb.common.language;
        query = "?api_key=" + theMovieDb.common.api_key;

        if (Object.keys(myOptions).length > 0) {
            for (option in myOptions) {
                if (myOptions.hasOwnProperty(option) && option !== "id" && option !== "body") {
                    query = query + "&" + option + "=" + myOptions[option];
                }
            }
        }
        return query;
    },
    validateCallbacks: function (success, error) {
        'use strict';
        if (typeof success !== "function" || typeof error !== "function") {
            throw "success and error parameters must be functions!";
        }
    },
    validateRequired: function (args, argsReq, opt, optReq, allOpt) {
        'use strict';
        var i, allOptional;

        allOptional = allOpt || false;

        if (args.length !== argsReq) {
            throw "The method requires  " + argsReq + " arguments and you are sending " + args.length + "!";
        }

        if (allOptional) {
            return;
        }

        if (argsReq > 2) {
            for (i = 0; i < optReq.length; i = i + 1) {
                if (!opt.hasOwnProperty(optReq[i])) {
                    throw optReq[i] + " is a required parameter and is not present in the options!";
                }
            }
        }
    },
    getImage: function (options) {
        'use strict';
        return theMovieDb.common.images_uri + options.size + "/" + options.file;
    },
    client: async function (options, success, error) {
        'use strict';
        axios.defaults.timeout = theMovieDb.common.timeout;

        const requestURL = theMovieDb.common.base_uri + options.url;
        console.log('Request URL', requestURL);

        return axios.get(requestURL)
            .then((response) => {
                    if (response.status === 200) {
                        success(response.statusText);
                        return response;
                    } else {
                        error(response.statusText);
                    }
                }
            )
            .catch((e) => {
                if (e.response) {
                    switch (e.response.status) {
                        case 401:
                            error('{"status_code":401,"status_message":"Unauthorized"}');
                            break;
                        case 429:
                            error('{"status_code":429,"status_message":"Too many requests"}');
                            break;
                        default:
                            error('{"status_code":' + e.response.status + ',"status_message":' + e.response.statusText);
                    }
                } else if (e.code) {
                    if (e.code === 'ECONNABORTED') {
                        error('{"status_code":408,"status_message":"Request timed out"}');
                    }
                } else {
                    error('{"status_code":' + e.code + ',"status_message":"Unhandled error"}');
                }
            });
    }
};

const THE_MOVIE_DB_X_RATE = 40;
const THE_MOVIE_DB_X_RATE_TIMEOUT = 12* 1000;

async function getMoviesDetails(blockbusters, successCB, errorCB) {

    if (blockbusters.length) {
        const chunks = getChunks(blockbusters);

        let results = [];
        return new Promise(resolve=> {
            for (let i = 0; i< chunks.length; i++){
                setTimeout(async()=>{
                    const chunk = chunks[i];

                    const chunkMoviesPromises = chunk.map(movie => {
                        return getMovieDetails({id: movie.id}, successCB, errorCB)
                    });
                    const chunkResults = await Promise.all(chunkMoviesPromises);
                    results = results.concat(chunkResults);

                    if(i === chunks.length-1){
                        resolve(results);
                    }
                }, (i+1) * THE_MOVIE_DB_X_RATE_TIMEOUT);
            }
        });

    } else {
        return blockbusters;
    }

}

function getChunks(blockbusters) {
    let i;
    let j;
    let chunks = [];
    let chunk = THE_MOVIE_DB_X_RATE;

    for (i = 0, j = blockbusters.length; i < j; i += chunk) {
        chunks.push(blockbusters.slice(i, i + chunk));
    }

    return chunks;
}

export async function data(qty = 50, successCB, errorCB) {
    const blockbusters = await discoverMovies({quantity: qty}, successCB, errorCB);

    const details = await getMoviesDetails(blockbusters, successCB, errorCB);

    return blockbusters.map(b => {
        if (details) {
            let detail = details.find(d => d.title === b.title);
            if (detail) {
                return {
                    imdb_id: detail.imdb_id,
                    api_id: b.id,
                    api_name: 'themoviedb',
                    title: b.title,
                    original_title: b.original_title,
                    genres: detail.genres,
                    release_date: b.release_date,
                    unlikely: b.unlikely,
                    budget: detail.budget,
                    website: detail.homepage,
                    production_companies: detail.production_companies,
                    revenue: detail.revenue,
                    length: detail.runtime,
                    original_language: b.original_language,
                    spoken_languages: detail.spoken_languages,
                    status: detail.status,
                    overview: b.overview,
                    tagline: detail.tagline,
                };
            }
        }
        return b;
    });
}

async function getMovieDetails(options, success, error) {
    'use strict';
    theMovieDb.common.validateRequired(arguments, 3, options, ["id"]);
    theMovieDb.common.validateCallbacks(success, error);

    const theMovieDbResponse = await theMovieDb.common.client({
            url: "movie/" + options.id + theMovieDb.common.generateQuery(options)
        },
        success,
        error
    );

    //TODO add another API to get the writer, actors, poster and so on.

    return theMovieDbResponse && theMovieDbResponse.data ? theMovieDbResponse.data : {};
}

function markUnlikelyMovies(initial) {
    return initial.map(mm => {
        mm.unlikely = !mm.release_date || mm.vote_count < 1000;
        return mm;
    });
}

async function discoverMovies(options, success, error) {
    theMovieDb.common.validateRequired(arguments, 3, "", "", true);
    theMovieDb.common.validateCallbacks(success, error);

    const baseURL = "discover/movie" + theMovieDb.common.generateQuery(options) + '&sort_by=revenue.desc';

    let requestCount = 0;
    const response = await theMovieDb.common.client({url: baseURL}, success, error);
    requestCount++;

    if (response) {
        const {total_results, total_pages, results} = response.data;

        let movies = markUnlikelyMovies(results);
        if (total_pages > 1 && movies.length < options.quantity && options.quantity <= total_results) {
            let page = 2;
            do {
                let response = await theMovieDb.common.client({url: baseURL + '&page=' + page++}, success, error);
                requestCount++;
                if (response && response.data) {
                    movies = movies.concat(markUnlikelyMovies(response.data.results));
                }
            } while (movies.length < options.quantity)
        }
        console.log('Success from themoviedb discover service!. Movies length', movies.length);

        return movies;
    }

    return [];

}
