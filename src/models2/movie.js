module.exports = (sequelize, type) => {
    return sequelize.define('movie', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        awards: type.STRING,
        type: {
            type: type.BIGINT
        },
        box_office: type.BIGINT,
        imdb_rating: type.STRING,
        poster: {
            type: type.BIGINT
        },
        imdb_id: {
            type: type.STRING,
            unique: true
        },
        title: {
            type: type.STRING,
            unique: true
        },
        release_date: type.STRING,
        length: type.INTEGER,
        overview: type.TEXT,
        plot_line: type.STRING,
        budget: type.BIGINT,
        cast_quantity: type.INTEGER,
        website: type.STRING,
        word_count: type.INTEGER,
        revenue: type.BIGINT,
        story_origin: type.BIGINT,
        valid: type.BOOLEAN
    }, {
        underscored: true
    })
 };
