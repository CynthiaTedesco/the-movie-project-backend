import axios from 'axios';

const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const fs = require("fs");

const iconvLite = require('iconv-lite');
const chardet = require('chardet');

const path = require('path');
const tmp = require('tmp');
const download = require('download');
const rimraf = require('rimraf');
const glob = require('glob');

const baseURL = 'https://subscene.com';
const searchByTitle = '/subtitles/searchbytitle';

const languages = {
    'en': {
        code: 13, //TODO add it to language table as subscene_code?
        name: 'English',
    },
    'it': {
        code: 26,
        name: 'Italian'
    }
};

async function execute() {
    console.log('==========================================================================');

    //TODO de- hard code
    const title = 'the lion king';
    const year = '2019';
    const language = languages.en.code;

    const path = await findPath(title, year, language);
    const subtitlesListLink = await findSubtitlesListPath(path, language);
    const subtitleDownloadPath = await findSubtitleDownloadPath(subtitlesListLink, language);

    const url = baseURL + subtitleDownloadPath;

    const movieName = title.split(' ').join('_');
    downloadSubtitle(url, movieName);
}

execute();

function findSubtitleDownloadPath(path, language) {
    const url = baseURL + path;

    return axios.get(url, {
        withCredentials: true,
        headers: {
            'cookie': 'LanguageFilter=' + language
        }
    }).then(results => {
        const vDom = new JSDOM(results.data);
        return vDom.window.document.querySelector('div.download a#downloadButton').href;
    });
}

function findSubtitlesListPath(path, language) {
    const url = baseURL + path;

    return axios.get(url, {
        withCredentials: true,
        headers: {
            'cookie': 'LanguageFilter=' + language
        }
    }).then(results => {
        const vDom = new JSDOM(results.data);
        return vDom.window.document.querySelector('table tr td.a1 a').href;
    });
}

function findPath(title, year, language) {
    return axios.post(baseURL + searchByTitle, {query: title}, {
        withCredentials: true,
        headers: {
            'cookie': 'LanguageFilter=' + language
        }
    }).then(results => {
        const vDom = new JSDOM(results.data);

        const thereAreExactResults = vDom.window.document
            .querySelector('.search-result h2').textContent === 'Exact';
        const appliedLanguageFilter = vDom.window.document
            .querySelector('#search .filter ul').textContent.indexOf('English') > -1;

        if (!thereAreExactResults) {
            return 'no results';
        } else {
            if (appliedLanguageFilter) {
                const exactList = vDom.window.document.querySelector('.search-result ul');
                const exactItems = exactList.querySelectorAll('li');
                let found = false;
                for (let i = 0; i < exactItems.length; i++) {
                    if (exactItems[i].textContent.indexOf(year) > -1) {
                        found = true;
                        return exactItems[i].querySelector('a').href;
                    }
                }

                if (!found) {
                    return 'no results';
                }
            } else {
                return 'no filter applied';
            }
        }

    });
}

function downloadSubtitle(downloadLink, movieName) {
    fetch(downloadLink)
        .then(function (subtitle) {
            // Convert to UTF8
            subtitle.content = convertToUTF8(subtitle.content);
            return subtitle;
        }).then(function (subtitle) {
            // Save the subtitle to a file with a matching name
            return saveSubtitle(subtitle.content, subtitle.type, movieName);
        }).then(function () {
            // Done
            console.log('Done !');

        }).catch(function (error) {

            // Something went wrong
            if (error) {
                console.error(error.toString());
            }

        });
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
        // Save the subtitle file
        fs.writeFile('./subtitles/' + movieName + '.' + type, content, 'utf8', function (error) {

            // Something went wrong
            if (error) {
                return reject(error);
            }

            resolve();

        });
    });

}

/**
 * Convert encoding to UTF-8
 *
 * @param  {Buffer} buffer
 * @return {String}
 */
function convertToUTF8(buffer) {
    // Detect the encoding
    var detectedEncoding = chardet.detect(buffer);

    // Already UTF8
    if (!detectedEncoding || detectedEncoding.toLowerCase() == 'utf-8' || detectedEncoding.toLowerCase() == 'ascii') {
        return buffer.toString();
    }

    return iconvLite.decode(buffer, detectedEncoding);
}

/**
 * Download, extract, and get the content of the subtitle file
 *
 * @param  {String}  downloadLink
 * @return {Promise} resolve with {content: buffer, type: (srt, ass, sub)}
 */
function fetch(downloadLink) {

    return new Promise(function (resolve, reject) {

        var tmpDir = tmp.dirSync().name;

        // Download and export the subtitle file
        download(downloadLink, tmpDir, {extract: true}).then(function () {

            // Get the subtitle file
            glob(path.join(tmpDir, '*.+(srt|ass|sub)'), {}, function (error, files) {

                // Something went wrong
                if (error) {
                    rimraf.sync(tmpDir);
                    return reject(error);
                }

                // Subtitle file not found
                if (!files.length) {
                    rimraf.sync(tmpDir);
                    return reject(new Error('Invalid subtitle file'));
                }

                resolve({
                    // Read the subtitle file
                    content: fs.readFileSync(files[0]),
                    // Get the type of the subtitle file
                    type: path.extname(files[0]).toLowerCase().substr(1)
                });

                // Cleanup
                rimraf.sync(tmpDir);

            });

        });

    });

}
