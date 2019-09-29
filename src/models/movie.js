module.exports = (sequelize, type) => {
    return sequelize.define('movie', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        imdb_id: type.STRING,
        title: type.STRING,
        release_date: type.STRING,
        length: type.INTEGER,
        director: type.INTEGER,
        writer: type.INTEGER,
        overview: type.TEXT,
        plot_line: type.STRING,
        budget: type.BIGINT,
        cast_quantity: type.INTEGER,
        poster: type.INTEGER,
        website: type.STRING,
        word_count: type.INTEGER,
        revenue: type.BIGINT,
        unlikely: type.BOOLEAN
    }, {
        underscored: true
    })
};
