import moment from 'moment';
import uuid from 'uuid';

class Movie1 {
    /**
     * class constructor
     * @param {object} data
     */
    constructor() {
        this.movies = [];
    }
    /**
     *
     * @returns {object} movie object
     */
    create(data) {
        const newMovie = {
            id: uuid.v4(),
            title: data.title,
            createdDate: moment.now(),
            modifiedDate: moment.now()
        };
        this.movies.push(newMovie);
        return newMovie
    }
    /**
     *
     * @param {uuid} id
     * @returns {object} movie object
     */
    findOne(id) {
        return this.movies.find(mo => mo.id === id);
    }
    /**
     * @returns {object} returns all movies
     */
    findAll() {
        return this.movies;
    }
    /**
     *
     * @param {uuid} id
     * @param {object} data
     */
    update(id, data) {
        const movie = this.findOne(id);
        const index = this.movies.indexOf(movie);
        this.movies[index].modifiedDate = moment.now();
        return this.movies[index];
    }
    /**
     *
     * @param {uuid} id
     */
    delete(id) {
        const movie = this.findOne(id);
        const index = this.movies.indexOf(movie);
        this.movies.splice(index, 1);
        return {};
    }
}
export default new Movie1();
