import * as themoviedb from './themoviedb';

const movieQty = 200;

function successCB(data) {
    console.log("Success callback: ", data);
}

function errorCB(data) {
    console.log("Error callback: " + data);
}

export async function list(){
    return themoviedb.data(movieQty, successCB, errorCB).then(theMovieDB_data => {
        return theMovieDB_data;
    });
}

