// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

// server.js
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';

import Movie from "./src/controllers/Movie";
import models from './models';

// Set up the express app
const app = express();
// Log requests to the console.
app.use(logger('dev'));

// app.use(express.json());
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//will be www who will put the server to listen
// app.listen(3000);

app.get('/', (req, res) => {
    return res.status(200).send({'message': 'YAY! Congratulations! Your first endpoint is working. Super!'});
});



// // create a movie
// app.post('/api/movies', (req, res) => {
//     Movie.create(req.body)
//         .then(movie => res.json(movie))
// });
// get all movies
app.get('/api/movies', (req, res) => {
    models.movie.findAll( {
        include: [{
            model: models.language,
            as: 'languages'
        }]
    }).then(movies =>
        res.status(200).send(movies)
    );
});

// // create a genre
// app.post('/api/genres', (req, res) => {
//     Genre.create(req.body)
//         .then(genre => res.json(genre))
// });
// // get all genres
// app.get('/api/genres', (req, res) => {
//     Genre.findAll().then(genres => res.json(genres))
// });

module.exports = app;

// app.post('/api/v1/movies', Movie.create);
// app.get('/api/v1/movies', Movie.getAll);
// app.get('/api/v1/movies/:id', Movie.getOne);
// app.put('/api/v1/movies/:id', Movie.update);
// app.delete('/api/v1/movies/:id', Movie.delete);

