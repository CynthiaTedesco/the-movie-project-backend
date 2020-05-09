const omdb = require('./omdb')
const themoviedb = require('./themoviedb')
const { getSubsFileName, processSubtitles } = require('../subs')

const fs = require('fs')
var subsrt = require('subsrt')

const movieQty = 100

async function list(db) {
  console.log('---------- LIST', movieQty)
  // const theMovieDB_data = await themoviedb.data(movieQty);
  // fs.writeFileSync('themoviedb_movies.json', JSON.stringify(theMovieDB_data, null, 2));

  const data = fs.readFileSync('movies.json')
  const theMovieDB_data = JSON.parse(data)

  // const Movie = MovieModel(db, Sequelize);
  // const localMovies = await Movie.findAll();

  const movies = theMovieDB_data || localMovies

  const omdb_data = await omdb.data(movies, successCB, errorCB)

  //TODO look at theMovieDB restrictions --> it's called certifications and we could get them by adding &append_to_response=release_dates to the url
  //TODO add name of the language from omdb
  //TODO check where to get the producer country name //TODO get the country from omdb!!
  const consolidatedAPIs = await Promise.all(
    movies.map(async (lm) => {
      let movie = lm.dataValues ? lm.dataValues : lm

      const omdb_movie = omdb_data.find((om) =>
        movie.imdb_id ? om.imdbID === movie.imdb_id : om.title === movie.title
      )
      if (omdb_movie) {
        movie.restrictions = [omdb_movie.Rated]
        movie.directors = omdb_movie.Director.split(', ')
        movie.writers = omdb_movie.Writer.split(', ')
        movie.actors = omdb_movie.Actors.split(', ')
        movie.awards = omdb_movie.Awards
        movie.poster = omdb_movie.Poster
        movie.imdb_rating = omdb_movie.imdbRating
        movie.type = omdb_movie.Type
        movie.box_offfice =
          omdb_movie.BoxOffice !== 'N/A' ? omdb_movie.BoxOffice : ''
      }

      return movie
    })
  )
  // const moviesWithSubtitlesFiles = await addSubsFileNames(consolidatedAPIs);
  const moviesWithSubtitlesFiles = consolidatedAPIs

  return moviesWithSubtitlesFiles.map(processSubtitles)
}

async function fetchMovieFullDetails(id) {
  let tmdb
  if (id.tmdb_id) {
    tmdb = await themoviedb.getMovieDetails({ id: tmdb_id })
  } else {
    tmdb = await themoviedb.getMovieDetails_byImdbId({
      imdb_id: id.imdb_id,
      external_source: 'imdb_id',
    })
    tmdb.tmdb_id = tmdb.id
    delete tmdb.id
  }
  const omdb_ = tmdb.imdb_id ? await omdb.findByIMDB(tmdb.imdb_id) : null

  let movie = tmdb
  if (omdb_) {
    movie.restrictions = [omdb_.Rated]
    movie.directors = omdb_.Director.split(', ')
    movie.writers = omdb_.Writer.split(', ')
    movie.actors = omdb_.Actors.split(', ')
    movie.awards = omdb_.Awards
    movie.poster = omdb_.Poster
    movie.imdb_rating = omdb_.imdbRating
    movie.type = omdb_.Type
    movie.box_office = omdb_.BoxOffice !== 'N/A' ? omdb_.BoxOffice : ''
  }

  movie.subsFileName = await getSubsFileName(movie)
  const updatedMovie = await processSubtitles(movie)

  return updatedMovie
}

function getMergedMovie(list = [], old, newm) {
  let updatedFields = []
  list.forEach((attr) => {
    let old_attr_name
    let new_attr_name
    if (typeof attr === 'object') {
      old_attr_name = attr.o
      new_attr_name = attr.n
    } else {
      old_attr_name = attr
      new_attr_name = attr
    }
    if (
      JSON.stringify(old[old_attr_name]) !== JSON.stringify(newm[new_attr_name])
    ) {
      updatedFields[old_attr_name] = newm[new_attr_name]
      old[old_attr_name] = newm[new_attr_name]
      old.updated = new Date()
    }
  })

  return updatedFields
}

function updateJSON(newMovie) {
  const oldFileContent = fs.readFileSync('movies.json')
  const oldMovies = JSON.parse(oldFileContent)

  let merged
  let oldMovie
  const toBeMerged = [
    'title',
    'original_title',
    'genres',
    'release_date',
    'budget',
    { o: 'website', n: 'homepage' },
    'production_companies',
    'production_countries',
    'revenue',
    { o: 'length', n: 'runtime' },
    'original_language',
    'spoken_languages',
    'status',
    'overview',
    { o: 'plot_line', n: 'tagline' },
    'restrictions',
    'directors',
    'writers',
    'actors',
    'awards',
    'poster',
    'imdb_rating',
    'type',
    'box_office',
    'subsFileName',
    'word_count',
    'most_used_word',
    'tmdb_id',
  ]
  let updatedFields
  const updatedMovies = oldMovies.map((om) => {
    if (om.imdb_id === newMovie.imdb_id) {
      oldMovie = Object.assign({}, om)
      updatedFields = getMergedMovie(toBeMerged, om, newMovie)
      return om
    }
    return om
  })
  if (JSON.stringify(merged) != JSON.stringify(oldMovie)) {
    //save to file
    try {
      const newFileContent = JSON.stringify(updatedMovies, null, 2)
      fs.writeFileSync('movies.json', newFileContent, () => {
        console.log('movies.json has been succesfuly updated!')
      })
      return updatedFields
    } catch (e) {
      console.log('error while saving the file!!!!!!')
      return false
    }
  } else {
    return false
  }
}
module.exports = {
  fetchMovieFullDetails,
  updateJSON,
  list,
}
