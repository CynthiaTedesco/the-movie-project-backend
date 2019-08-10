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
        query = "?api_key=" + theMovieDb.common.api_key + "&language=" + theMovieDb.common.language;

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
                    if (e.response.status === 401) {
                        error('{"status_code":401,"status_message":"Unauthorized"}');
                    }
                }
                if (e.code) {
                    if (e.code === 'ECONNABORTED') {
                        error('{"status_code":408,"status_message":"Request timed out"}');
                    }
                }
                error('{"status_code":' + e.code + ',"status_message":"Unhandled error"}');
            });
    }
};

let quantity = 20;

export async function data(qty, successCB, errorCB) {
    quantity = qty;
    const discoveredMovies = await discoverMovies({}, successCB, errorCB);
    return discoveredMovies;
}

async function discoverMovies(options, success, error) {
    theMovieDb.common.validateRequired(arguments, 3, "", "", true);
    theMovieDb.common.validateCallbacks(success, error);

    const baseURL = "discover/movie" + theMovieDb.common.generateQuery(options);

    const response = await theMovieDb.common.client({url: baseURL}, success, error);

    if (response) {
        const {total_results, total_pages, results} = response.data;

        let movies = results;
        if (total_pages > 1 && movies.length < quantity && quantity <= total_results) {
            let page = 2;
            do {
                let moreMovies = await theMovieDb.common.client({url: baseURL + '&page=' + page++}, success, error);
                movies = movies.concat(moreMovies.data.results);
            } while (movies.length < quantity)
        }
        // console.log('Success from themoviedb service!. Movies length', movies.length);

        return movies;
    }

    return [];

}
