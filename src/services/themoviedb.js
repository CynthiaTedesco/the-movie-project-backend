require('dotenv/config')
const axios = require('axios')
const { successCB, errorCB } = require('./common')
// import axios from 'axios'
// import 'dotenv/config'

//https://github.com/cavestri/themoviedb-javascript-library/wiki

let theMovieDb = {}

theMovieDb.common = {
  api_key: process.env.THE_MOVIE_DB_API_KEY,
  base_uri: 'http://api.themoviedb.org/3/',
  images_uri: 'http://image.tmdb.org/t/p/',
  timeout: 2000,
  language: 'en-US',
  generateQuery: function (options) {
    'use strict'
    var myOptions, query, option

    myOptions = options || {}
    // query = "?api_key=" + theMovieDb.common.api_key + "&language=" + theMovieDb.common.language;
    query = '?api_key=' + theMovieDb.common.api_key

    if (Object.keys(myOptions).length > 0) {
      for (option in myOptions) {
        if (
          myOptions.hasOwnProperty(option) &&
          option !== 'id' &&
          option !== 'body'
        ) {
          query = query + '&' + option + '=' + myOptions[option]
        }
      }
    }
    return query
  },
  validateCallbacks: function (success, error) {
    'use strict'
    if (typeof success !== 'function' || typeof error !== 'function') {
      throw 'success and error parameters must be functions!'
    }
  },
  validateRequired: function (args, argsReq, opt, optReq, allOpt) {
    'use strict'
    var i, allOptional

    allOptional = allOpt || false

    if (args.length !== argsReq) {
      throw (
        'The method requires  ' +
        argsReq +
        ' arguments and you are sending ' +
        args.length +
        '!'
      )
    }

    if (allOptional) {
      return
    }

    if (argsReq > 2) {
      for (i = 0; i < optReq.length; i = i + 1) {
        if (!opt.hasOwnProperty(optReq[i])) {
          throw (
            optReq[i] +
            ' is a required parameter and is not present in the options!'
          )
        }
      }
    }
  },
  getImage: function (options) {
    'use strict'
    return theMovieDb.common.images_uri + options.size + '/' + options.file
  },
  client: async function (options, success, error) {
    'use strict'
    axios.defaults.timeout = theMovieDb.common.timeout

    const requestURL = theMovieDb.common.base_uri + options.url

    return axios
      .get(requestURL)
      .then((response) => {
        console.log(
          response.statusText,
          '[themoviedb]- Request URL',
          requestURL
        )
        if (response.status === 200) {
          success(response.statusText)
          return response
        } else {
          error(response.statusText)
        }
      })
      .catch((e) => {
        console.log('ERROR', e, requestURL)
        if (e.response) {
          switch (e.response.status) {
            case 401:
              error('{"status_code":401,"status_message":"Unauthorized"}')
              break
            case 429:
              error('{"status_code":429,"status_message":"Too many requests"}')
              break
            default:
              error(
                '{"status_code":' +
                  e.response.status +
                  ',"status_message":' +
                  e.response.statusText
              )
          }
        } else if (e.code) {
          if (e.code === 'ECONNABORTED') {
            error('{"status_code":408,"status_message":"Request timed out"}')
          }
        } else {
          error(
            '{"status_code":' + e.code + ',"status_message":"Unhandled error"}'
          )
        }
      })
  },
}

const THE_MOVIE_DB_X_RATE = 50 //TODO remove this! themoviedb api has changed their no-limit policy :)
const THE_MOVIE_DB_X_RATE_TIMEOUT = 12 * 1000

function markUnlikelyMovies(initial) {
  return initial.map((mm) => {
    mm.valid = !(!mm.release_date || mm.vote_count < 1000)
    return mm
  })
}
function getChunks(list) {
  let i
  let j
  let chunks = []
  let chunk = THE_MOVIE_DB_X_RATE

  for (i = 0, j = list.length; i < j; i += chunk) {
    chunks.push(list.slice(i, i + chunk))
  }

  return chunks
}

async function getMoviesDetails(blockbusters) {
  if (blockbusters.length) {
    const chunks = getChunks(blockbusters)

    let results = []
    return new Promise(async (resolve) => {
      for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]

          const chunkMoviesPromises = chunk.map((movie) => {
            return getMovieDetails({ id: movie.id }, successCB, errorCB)
          })
          const chunkResults = await Promise.all(chunkMoviesPromises)
          results = results.concat(chunkResults)

          if (i === chunks.length - 1) {
            resolve(results)
          }

      }
    })
  } else {
    return blockbusters
  }
}
async function getMovieDetails_byImdbId(options, success, error) {
  success = success || successCB
  error = error || errorCB

  const theMovieDbResponse = await theMovieDb.common.client(
    {
      url: 'find/' + options.imdb_id + theMovieDb.common.generateQuery(options),
    },
    success,
    error
  )
  if (
    theMovieDbResponse &&
    theMovieDbResponse.data &&
    theMovieDbResponse.data.movie_results &&
    theMovieDbResponse.data.movie_results.length
  ) {
    return getMovieDetails(
      { id: theMovieDbResponse.data.movie_results[0].id }
    )
  } else {
    return {}
  }
}

async function getMovieDetails(options, success, error) {
  'use strict' //TODO check if it works without stric mode
  success = success || successCB
  error = error || errorCB

  theMovieDb.common.validateRequired([options], 1, options, ['id'])
  theMovieDb.common.validateCallbacks(success, error)

  const theMovieDbResponse = await theMovieDb.common.client(
    {
      url: 'movie/' + options.id + theMovieDb.common.generateQuery(options),
    },
    success,
    error
  )

  return theMovieDbResponse && theMovieDbResponse.data
    ? theMovieDbResponse.data
    : {}
}
async function discoverMovies(options, success, error) {
  theMovieDb.common.validateRequired(arguments, 3, '', '', true)
  theMovieDb.common.validateCallbacks(success, error)

  const baseURL =
    'discover/movie' +
    theMovieDb.common.generateQuery(options) +
    '&sort_by=revenue.desc'

  let requestCount = 0
  const response = await theMovieDb.common.client(
    { url: baseURL },
    success,
    error
  )
  requestCount++

  if (response) {
    const { total_results, total_pages, results } = response.data

    let movies = markUnlikelyMovies(results)
    if (
      total_pages > 1 &&
      movies.length < options.quantity &&
      options.quantity <= total_results
    ) {
      let page = 2
      do {
        let response = await theMovieDb.common.client(
          { url: baseURL + '&page=' + page++ },
          success,
          error
        )
        requestCount++
        if (response && response.data) {
          movies = movies.concat(markUnlikelyMovies(response.data.results))
        }
      } while (movies.length < options.quantity)
    }
    console.log(
      'Success from themoviedb discover service!. Movies length',
      movies.length
    )

    return movies
  }

  return []
}

async function data(qty = 50, success = successCB, error = errorCB) {
  const blockbusters = await discoverMovies({ quantity: qty }, success, error)
  if (blockbusters.length) {
    const details = await getMoviesDetails(blockbusters, success, error)
    return blockbusters.map((b) => {
      if (details) {
        let detail = details.find((d) => d.title === b.title)
        if (detail) {
          return {
            imdb_id: detail.imdb_id,
            tmdb_id: b.id,
            api_id: b.id,
            api_name: 'themoviedb',
            title: b.title,
            original_title: b.original_title,
            genres: detail.genres,
            release_date: b.release_date,
            valid: b.valid,
            budget: detail.budget,
            website: detail.homepage,
            production_companies: detail.production_companies,
            production_countries: detail.production_countries,
            revenue: detail.revenue,
            length: detail.runtime,
            original_language: b.original_language,
            spoken_languages: detail.spoken_languages,
            status: detail.status,
            overview: b.overview,
            tagline: detail.tagline,
          }
        }
      }
      return b
    })
  } else {
    return blockbusters
  }
}

async function searchPerson(options) {
  'use strict'
  theMovieDb.common.validateRequired(arguments, 3, options, ['query'])
  theMovieDb.common.validateCallbacks(successCB, errorCB)

  return await theMovieDb.common.client(
    {
      url: 'search/person' + theMovieDb.common.generateQuery(options),
    },
    successCB,
    errorCB
  )
}

async function getPersonDetails(options) {
  ;('use strict')
  theMovieDb.common.validateRequired(arguments, 3, '', '', true)
  theMovieDb.common.validateCallbacks(successCB, errorCB)

  return await theMovieDb.common.client(
    {
      url: 'person/' + options.id + theMovieDb.common.generateQuery(options),
    },
    successCB,
    errorCB
  )
}

const genderList = {
  '0': 'Non-specified',
  '1': 'Female',
  '2': 'Male',
}

function processPeople(list) {
  const chunks = getChunks(list)

  let results = []
  return new Promise(async (resolve) => {
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        const chunkPeopleSearchPromises = chunk.map((person) => {
          return searchPerson({ query: person.name }, successCB, errorCB).then(
            ({ data }) => {
              if (data.results.length) {
                return getPersonDetails(
                  { id: data.results[0].id },
                  successCB,
                  errorCB
                ).then(({ data }) => {
                  person.date_of_birth = data.birthday
                  person.gender = genderList[data.gender] || null

                  return person.save()
                })
              }
              return null;
            }
          )
        })
        const chunkResults = await Promise.all(chunkPeopleSearchPromises)
        results = results.concat(chunkResults)

        if (i === chunks.length - 1) {
          resolve(results)
        }

    }
  })
}

module.exports = {
  processPeople,
  getMovieDetails,
  getMovieDetails_byImdbId,
  discoverMovies,
  data,
}
