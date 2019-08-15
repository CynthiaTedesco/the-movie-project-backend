// https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz

// server.js
import express from 'express';
// import Movie from './src/controllers/Movie';
import {Movie, Genre} from './src/sequelize'

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    return res.status(200).send({'message': 'YAY! Congratulations! Your first endpoint is working. Super!'});
});

app.listen(3000);
console.log('app running on port ', 3000);


// create a movie
app.post('/api/movies', (req, res) => {
    Movie.create(req.body)
        .then(movie => res.json(movie))
});
// get all movies
app.get('/api/movies', (req, res) => {
    Movie.findAll().then(movies => res.json(movies))
});

// create a genre
app.post('/api/genres', (req, res) => {
    Genre.create(req.body)
        .then(genre => res.json(genre))
});
// get all genres
app.get('/api/genres', (req, res) => {
    Genre.findAll().then(genres => res.json(genres))
});

// app.post('/api/v1/movies', Movie.create);
// app.get('/api/v1/movies', Movie.getAll);
// app.get('/api/v1/movies/:id', Movie.getOne);
// app.put('/api/v1/movies/:id', Movie.update);
// app.delete('/api/v1/movies/:id', Movie.delete);

