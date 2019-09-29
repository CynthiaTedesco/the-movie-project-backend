import * as movies from './services/movies';
import {closeConnection, syncModels} from "./sequelize";
import {disconnectDB} from "./connection";

execute();

async function execute() {
    console.log('executing index.js and about to call movies.list');
    const allTheMovies = await movies.list();

    await syncModels();
    populateTables(allTheMovies);

    await closeConnection();
    // try {
    //     const client = await connectDB();
    //
    //     const results =
    //         await client.query('select * from mp1_test_table');
    //     console.table(results.rows);
    //
    // } catch (ex) {
    //     console.log(`Something wrong happened ${ex}`);
    // } finally {
    //     await disconnectDB();
    // }
}

function populateTables(data) {
    console.log('populating data. with e.g. ----> ', data[0]);
}
