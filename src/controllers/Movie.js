import MovieModel from '../../models/Movie';

const Movie = {
    /**
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} movie object
     */
    create(req, res) {
        // if (!req.body.success && !req.body.lowPoint && !req.body.takeAway) {
        //     return res.status(400).send({'message': 'All fields are required'})
        // }
        const movie = MovieModel.create(req.body);
        return res.status(201).send(movie);
    },
    /**
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} movies array
     */
    getAll(req, res) {
        const movies = MovieModel.findAll();
        return res.status(200).send(movies);
    },
    /**
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} movie object
     */
    getOne(req, res) {
        const movie = MovieModel.findOne(req.params.id);
        if (!movie) {
            return res.status(404).send({'message': 'movie not found'});
        }
        return res.status(200).send(movie);
    },
    /**
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} updated movie
     */
    update(req, res) {
        const movie = MovieModel.findOne(req.params.id);
        if (!movie) {
            return res.status(404).send({'message': 'movie not found'});
        }
        const updatedMovie = MovieModel.update(req.params.id, req.body);
        return res.status(200).send(updatedMovie);
    },
    /**
     *
     * @param {object} req
     * @param {object} res
     * @returns {void} return statuc code 204
     */
    delete(req, res) {
        const movie = MovieModel.findOne(req.params.id);
        if (!movie) {
            return res.status(404).send({'message': 'movie not found'});
        }
        const ref = MovieModel.delete(req.params.id);
        return res.status(204).send(ref);
    }
};

export default Movie;
