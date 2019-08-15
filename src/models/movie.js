module.exports = (sequelize, type) => {
    return sequelize.define('movie', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        imdb_id: type.INTEGER,
        title: type.STRING,
        release_date: type.DATE,
        length: type.INTEGER,
        director: type.INTEGER,
        writer: type.INTEGER,
        overview: type.STRING,
        plot: type.INTEGER,
        budget: type.FLOAT,
        cast_quantity: type.INTEGER,
        poster: type.INTEGER,
        website: type.STRING,
    })
};
