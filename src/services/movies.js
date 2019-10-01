import * as themoviedb from './themoviedb';

const movieQty = 200;

function successCB(data) {
    // console.log("Success callback: ", data);
}

function errorCB(data) {
    console.log("Error callback: " + data);
}

export async function list(){
    const theMovieDB_data = await themoviedb.data(movieQty, successCB, errorCB);
    return theMovieDB_data;
}

