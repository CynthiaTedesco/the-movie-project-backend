import { connectDB, disconnectDB } from './connection'

export async function syncModels(forceSync) {
  const db = await connectDB()
  //db.sync() will create all of the tables in the specified database.
  // If you pass {force: true} , it will drop tables on every startup and create new ones.
  // Needless to say, this is a viable option only for development.
  db.sync({ force: !!forceSync }).then(() => {
    console.log('Tables have been synced!'.arguments)
  })

  return db;
}

export async function closeConnection() {
  await new Promise(resolve => {
    setTimeout(async () => {
      await disconnectDB()
      resolve()
    }, 2000)
  })
}
