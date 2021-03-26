const axios = require('axios')
require('dotenv/config')

const API_KEY = process.env.OMDB_API_KEY

function findByTitle(title) {
  title = encodeURI(title)
  if (title.indexOf("'") > -1) {
    title = title.split("'").join('%27')
  }
  const url = 'http://www.omdbapi.com/?t=' + title + '&apikey=' + API_KEY
  console.log('Request URL = ', url)

  return axios
    .get(url)
    .then((result) => {
      if (result.status === 200) {
        console.log('[findByTitle] - returning data of "', title, '"')
        return result.data
      } else {
        console.log('not 200 status result')
        return null
      }
    })
    .catch(console.log)
}
function findByIMDB(imdb_id) {
  const url = 'http://www.omdbapi.com/?i=' + imdb_id + '&apikey=' + API_KEY
  console.log('Request URL = ', url)

  return axios
    .get(url)
    .then((result) => {
      console.log(result.statusText, '[omdb] - Request URL', url)
      if (result.status === 200) {
        console.log('[omdb - findByIMDB] - returning data of "', imdb_id, '"')
        return result.data
      } else {
        console.log('not 200 status result')
        return null
      }
    })
    .catch((error) => {
      console.log('odmb internal ERROR', error, url)
      console.log(error)
    })
}

async function data(moviesList) {
  const mapped = await Promise.all(
    moviesList.map((localMovie) => {
      return findByIMDB(
        localMovie.dataValues
          ? localMovie.dataValues.imdb_id
          : localMovie.imdb_id
      ).then((findByIMDB) => {
        if (!findByIMDB) {
          return findByTitle(
            localMovie.dataValues
              ? localMovie.dataValues.title
              : localMovie.title
          )
        }
        return findByIMDB
      })
    })
  )

  return mapped
}

module.exports = {
  findByIMDB,
  data
}
