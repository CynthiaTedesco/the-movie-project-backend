This project creates the database tables, populates them by querying different movies public APIs and publishes an API to be used by the-project-movie-frontend project.

This project uses sequelize, express, dotenv and nodejs

- dotenv is a module  that load  environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.
- nodejs is an open-source, cross-platform, JavaScript run-time environment that executes JavaScript code outside of a browser.
- express is a light-weight web application framework to help organize your web application into an MVC architecture on the server side
- sequelize is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.

Steps

1. Create the .env file with this content:

  ```
  DB_USERNAME=postgres
  DB_PASSWORD=postgres
  DB_HOST=localhost
  DB_PORT=5432
  DB_DIALECT=postgres
  DB_NAME=tmp

  TEST_DB_USERNAME=egnbfvcpcibicf
  TEST_DB_PASSWORD=4450df54c1476399d83a7fc5759605ffba0f481580878a0c7305dc6e78b2aed0
  TEST_DB_HOST=ec2-54-246-89-234.eu-west-1.compute.amazonaws.com
  TEST_DB_PORT=5432
  TEST_DB_DIALECT=postgres
  TEST_DB_NAME=db1bbm34ruejn6

  THE_MOVIE_DB_API_KEY = 8092fc4d0a05857839d0f41a079d8d1b
  OMDB_API_KEY=d199ef7e

  HEROKU_DB_URL = postgres://egnbfvcpcibicf:4450df54c1476399d83a7fc5759605ffba0f481580878a0c7305dc6e78b2aed0@ec2-54-246-89-234.eu-west-1.compute.amazonaws.com:5432/db1bbm34ruejn6
  ```

2. ```npm install```

3. generate database

  The database tables creation is done by the function sync() inside sequelize.js file. This file is executed from index.js when we start the seeder by using:

  ```
  npm run prepare_db
  npm run populate
  ```

4. Run server with ```npm run dev```