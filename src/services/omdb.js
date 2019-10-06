import axios from 'axios';
import 'dotenv/config';

// http://www.omdbapi.com/?i=tt0499549&apikey=d199ef7e

const API_KEY = process.env.OMDB_API_KEY;

function findByTitle(title) {
    title = encodeURI(title);
    if (title.indexOf('\'') > -1) {
        title = title.split('\'').join('%27');
    }
    const url = 'http://www.omdbapi.com/?t=' + title + '&apikey=' + API_KEY;
    console.log('Request URL = ', url);

    return axios.get(url)
        .then(result => {
            if (result.status === 200) {
                console.log('returning data of "', title, '"');
                return result.data;
            } else {
                debugger;
            }
        })
        .catch(error => {
            debugger;
        })

}

export function data(moviesList) {
    const mapped = Promise.all(moviesList.map(localMovie => {
        return findByTitle(localMovie.dataValues.title);
    }));
    debugger;
    return mapped;
}
