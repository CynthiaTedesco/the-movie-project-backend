import * as movies from './services/movies';
import {closeConnection, syncModels} from "./sequelize";
import populate from "./seed";
const fs = require("fs");

execute();

async function execute() {
    const db = await syncModels();
    movies.list(db).then(async allTheMovies => {

        //save to file
        let data = JSON.stringify(allTheMovies, null, 2);
        fs.writeFileSync('movies.json', data, () => {
            console.log('everything is set!')
        });

        // const data = fs.readFileSync('movies.json');
        // const allTheMovies = JSON.parse(data);
        await populate(allTheMovies, db);
        await closeConnection();
    });
}
