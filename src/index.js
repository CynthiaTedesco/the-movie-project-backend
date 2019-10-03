import * as movies from './services/movies';
import {closeConnection, syncModels} from "./sequelize";
import populate from "./seed";

execute();

async function execute() {
    movies.list().then(async allTheMovies => {
        const db = await syncModels();
        await populate(allTheMovies, db);

        await closeConnection();
    });
}
