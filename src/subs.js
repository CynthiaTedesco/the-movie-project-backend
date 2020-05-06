const axios = require('axios')
const stringSimilarity = require('string-similarity')

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')
var subsrt = require('subsrt')

const iconvLite = require('iconv-lite')
const chardet = require('chardet')

const path = require('path')
const tmp = require('tmp')
const download = require('download')
const rimraf = require('rimraf')
const glob = require('glob')

const baseURL = 'https://subscene.com'
const searchByTitle = '/subtitles/searchbytitle'

const languages = {
  en: {
    code: 13, //TODO add it to language table as subscene_code?
    name: 'English',
  },
  it: {
    code: 26,
    name: 'Italian',
  },
}

export default function getSubtitleFileName(title, year, lang) {
  return new Promise((resolve, reject) => {
    //gets Subscene language code
    const language = (languages[lang] || languages.en).code

    try {
      const path = './subtitles/' + title.split(' ').join('_') + '.srt'
      if (fs.existsSync(path)) {
        return resolve(path)
      }
    } catch (err) {
      console.error(err)
    }

    console.log('1. = ', title, 'finding path')
    findPath(title, year, language)
      .then((path = 'no results') => {
        if (path === 'no results') {
          console.log('1.1. = NOT found it')
          return path
        } else {
          console.log('1.1. = Found it', path)
        }

        console.log('2. ==== ', title, 'first path=', path)
        return findSubtitlesListPath(path, language)
      })
      .then((subtitlesListLink = 'no results') => {
        if (subtitlesListLink === 'no results') {
          console.log('2.1. === Not found')
          return subtitlesListLink
        } else {
          console.log('2.1. === Found it', subtitlesListLink)
        }

        console.log(
          '3. ======== ',
          title,
          'subtitlesListLink',
          subtitlesListLink
        )
        return findSubtitleDownloadPath(subtitlesListLink, language)
      })
      .then((subtitleDownloadPath = 'no results') => {
        if (subtitleDownloadPath === 'no results') {
          console.log('3.1. ======== Not found')
          return subtitleDownloadPath
        } else {
          console.log('3.1. ======= Found it!', subtitleDownloadPath)
        }

        console.log(
          '4. ============ ',
          title,
          'subtitleDownloadPath',
          subtitleDownloadPath
        )
        const url = baseURL + subtitleDownloadPath
        const movieName = title.split(' ').join('_')
        return downloadSubtitle(url, movieName)
      })
      .then((fileName = 'no results') => {
        console.log('5. ================ ', title, 'filename', fileName)
        resolve(fileName === 'no results' ? '' : fileName)
      })
      .catch((error) => {
        console.log('++++error with movie', title, error)
        reject(error)
      })
  })
}

function findSubtitleDownloadPath(path, language) {
  if (!path) return 'no results'

  const url = baseURL + path

  return axios
    .get(url, {
      withCredentials: true,
      headers: {
        cookie: 'LanguageFilter=' + language,
      },
    })
    .then((results) => {
      const vDom = new JSDOM(results.data)
      return vDom.window.document.querySelector('div.download a#downloadButton')
        .href
    })
}

function findSubtitlesListPath(path, language) {
  if (!path) return 'no results'

  const url = baseURL + path

  return axios
    .get(url, {
      withCredentials: true,
      headers: {
        cookie: 'LanguageFilter=' + language,
      },
    })
    .then((results) => {
      const vDom = new JSDOM(results.data)
      return vDom.window.document.querySelector('table tr td.a1 a').href
    })
}

function findPath(title, year, language) {
  return axios
    .post(
      baseURL + searchByTitle,
      { query: title },
      {
        withCredentials: true,
        headers: {
          cookie: 'LanguageFilter=' + language,
        },
      }
    )
    .then((results) => {
      if (results.status === 200) {
        const vDom = new JSDOM(results.data)

        const li_results = vDom.window.document.querySelectorAll(
          '.search-result ul li'
        )
        let found = false
        for (let i = 0; i < li_results.length; i++) {
          if (li_results[i].textContent.indexOf(year) > -1) {
            let cleanLiTitle = li_results[i]
              .querySelector('div.title a')
              .textContent.replace('(' + year + ')', '')

            if (
              cleanLiTitle.indexOf(title) > -1 &&
              cleanLiTitle.indexOf('(' > -1)
            ) {
              cleanLiTitle = cleanLiTitle.split(' (')[0]
            }

            const similarity = stringSimilarity.compareTwoStrings(
              title,
              cleanLiTitle
            )
            if (similarity > 0.75) {
              found = true
              return li_results[i].querySelector('a').href
            }

            if (cleanLiTitle.indexOf(':') > -1) {
              const titleParts = cleanLiTitle.split(':')
              for (let y = 0; y < titleParts.length; y++) {
                const similarity = stringSimilarity.compareTwoStrings(
                  title,
                  titleParts[i] || ''
                )
                if (similarity > 0.75) {
                  found = true
                  return li_results[i].querySelector('a').href
                }
              }
            }
          }
        }
        return 'no results'
      } else {
        return 'no results'
      }
    })
    .catch((error) => {
      console.log(
        '++++++ error while getting searchByPath',
        error.response ? error.response.config.data : error
      )
      return 'no results'
    })
}

function downloadSubtitle(downloadLink, movieName) {
  return new Promise(function (resolve, reject) {
    fetch(downloadLink)
      .then(function (subtitle) {
        // Convert to UTF8
        subtitle.content = convertToUTF8(subtitle.content)
        return subtitle
      })
      .then(function (subtitle) {
        // Save the subtitle to a file with a matching name
        return saveSubtitle(subtitle.content, subtitle.type, movieName)
      })
      .then((fileName) => {
        resolve(fileName)
      })
      .catch(function (error) {
        // Something went wrong
        reject(error)
      })
  })
}

/**
 * Save Subtitle
 *
 * @param {String}   content
 * @param {String}   type (str, ass)
 * @param movieName
 * @return {Promise}
 */
function saveSubtitle(content, type, movieName) {
  return new Promise(function (resolve, reject) {
    const fileName = './subtitles/' + movieName + '.' + type

    // Save the subtitle file
    fs.writeFile(fileName, content, 'utf8', function (error) {
      // Something went wrong
      if (error) {
        return reject(error)
      }

      resolve(fileName)
    })
  })
}

/**
 * Convert encoding to UTF-8
 *
 * @param  {Buffer} buffer
 * @return {String}
 */
function convertToUTF8(buffer) {
  // Detect the encoding
  var detectedEncoding = chardet.detect(buffer)

  // Already UTF8
  if (
    !detectedEncoding ||
    detectedEncoding.toLowerCase() == 'utf-8' ||
    detectedEncoding.toLowerCase() == 'ascii'
  ) {
    return buffer.toString()
  }

  return iconvLite.decode(buffer, detectedEncoding)
}

/**
 * Download, extract, and get the content of the subtitle file
 *
 * @param  {String}  downloadLink
 * @return {Promise} resolve with {content: buffer, type: (srt, ass, sub)}
 */
function fetch(downloadLink) {
  return new Promise(function (resolve, reject) {
    var tmpDir = tmp.dirSync().name

    // Download and export the subtitle file
    download(downloadLink, tmpDir, { extract: true }).then(function () {
      // Get the subtitle file
      glob(path.join(tmpDir, '*.+(srt|ass|sub)'), {}, function (error, files) {
        // Something went wrong
        if (error) {
          rimraf.sync(tmpDir)
          return reject(error)
        }

        // Subtitle file not found
        if (!files.length) {
          rimraf.sync(tmpDir)
          return reject(new Error('Invalid subtitle file'))
        }

        resolve({
          // Read the subtitle file
          content: fs.readFileSync(files[0]),
          // Get the type of the subtitle file
          type: path.extname(files[0]).toLowerCase().substr(1),
        })

        // Cleanup
        rimraf.sync(tmpDir)
      })
    })
  })
}

function promiseSerial(functions) {
  return functions.reduce(
    (promise, func) =>
      promise.then((result) => {
        return func().then(Array.prototype.concat.bind(result))
      }),
    Promise.resolve([])
  )
}

function addSubsFileNames(moviesList) {
  return promiseSerial(moviesList.map((l, i) => () => subsPromise(l, i))).then(
    (results) => {
      return results
    }
  )
}

function subsPromise(movie) {
  return new Promise((resolve) => {
    console.log(' ')
    console.log(movie.title, '0. !!!!!! Started subsPromise')

    if (movie.subsFileName) {
      return resolve(movie)
    }

    return getSubsFileName(movie).then(async (fileName) => {
      console.log(
        movie.title,
        '99. -!!!!!! Finished subsPromise. Resolving...',
        fileName
      )
      movie.subsFileName = fileName

      const resolution = await new Promise((resolve) => {
        setTimeout(() => resolve(movie), 3000)
      })

      resolve(resolution)
    })
  })
}

function getSubsFileName(movie) {
  const year = new Date(movie.release_date).getFullYear()
  const language = movie.original_language || 'en'
  return getSubtitleFileName(movie.title, year, language)
}

function processSubtitles(movie) {
  try {
    if (movie.subsFileName && fs.existsSync(movie.subsFileName)) {
      console.log('TRUE')
      const content = fs.readFileSync(movie.subsFileName, 'utf8')

      //Parse the content
      const captions = subsrt.parse(content, {})

      let wordsCount = 0
      let words = []
      console.log('captions', captions.length)
      captions.forEach((line) => {
        const sanitizedLine = line.text
          .replace(/<\/?[^>]+(>|$)/g, '') //removes html tags
          .replace(/\r?\n|\r/g, ' ') //removes new lines
          .replace(/ *\([^)]*\) */g, '') //removes parenthesis

        const lineWords = sanitizedLine.split(' ')

        wordsCount += lineWords.length
        lineWords.forEach((word) => {
          let sanitizedWord = word
            .replace(',', '')
            .replace('.', '')
            .replace('?', '')
            .replace('!', '')
            .toUpperCase()

          if (words.findIndex((w) => w.sanitizedWord === sanitizedWord) > -1) {
            const wordArrayItem = words.find(
              (w) => w.sanitizedWord === sanitizedWord
            )
            wordArrayItem.count += 1
          } else {
            words.push({
              word,
              count: 1,
              sanitizedWord,
            })
          }
        })
      })

      movie.word_count = wordsCount
      if (words.length) {
        movie.most_used_word = words.sort(
          (w1, w2) => -w1.count + w2.count
        )[0].word
      } else {
        console.log(
          '---------------------------- movie without words:',
          movie.title
        )
      }

      return movie
    } else {
      return movie
    }
  } catch (err) {
    console.error(err)
    return movie
  }
}

module.exports = {
  addSubsFileNames,
  getSubsFileName,
  processSubtitles,
}
