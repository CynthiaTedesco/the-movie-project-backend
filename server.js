// server.js
import express from 'express';
import Movie from './src/controllers/Movie';


const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    return res.status(200).send({'message': 'YAY! Congratulations! Your first endpoint is working. Super!'});
});

app.listen(3000);
console.log('app running on port ', 3000);

app.post('/api/v1/movies', Movie.create);
app.get('/api/v1/movies', Movie.getAll);
app.get('/api/v1/movies/:id', Movie.getOne);
app.put('/api/v1/movies/:id', Movie.update);
app.delete('/api/v1/movies/:id', Movie.delete);

