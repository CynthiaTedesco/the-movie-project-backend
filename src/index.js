import {connectDB, disconnectDB} from './connection';
import * as movies from './services/movies';

execute();

async function execute() {
    console.log('executing index.js and about to call movies.list');
    const allTheMovies = movies.list();

    createDatabaseTables();
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

function createDatabaseTables(){}
