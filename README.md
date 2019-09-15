This project creates the database tables, populates them by querying different movies public APIs and publishes an API to be used by the-project-movie-frontend project.

This project uses sequelize, express, dotenv and nodejs

- dotenv is a module  that load  environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.
- nodejs is an open-source, cross-platform, JavaScript run-time environment that executes JavaScript code outside of a browser.
- express is a light-weight web application framework to help organize your web application into an MVC architecture on the server side
- sequelize is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server. 

The database tables creation is done by the function sync() inside sequelize.js file. This file is executed from server.js when we build the project by using:
```
yarn run build
```

