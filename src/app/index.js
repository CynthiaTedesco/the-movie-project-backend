import {connectDB, disconnectDB} from './connection';

execute();

async function execute() {
    try {
        const client = await connectDB();

        const results =
            await client.query('select * from mp1_test_table');
        console.table(results.rows);

    } catch (ex) {
        console.log(`Something wrong happened ${ex}`);
    } finally {
        await disconnectDB();
    }
}
