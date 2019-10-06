import * as movies from './services/movies';
import {closeConnection, syncModels} from "./sequelize";
import populate from "./seed";

execute();

async function execute() {
    const db = await syncModels();
    movies.list(db).then(async allTheMovies => {
        await populate(allTheMovies, db);
        await closeConnection();
    });
}
