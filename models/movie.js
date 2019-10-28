'use strict';
module.exports = (sequelize, DataTypes) => {
    const movie = sequelize.define('movie', {
        awards: DataTypes.STRING,
        box_office: DataTypes.BIGINT,
        imdb_rating: DataTypes.STRING,
        imdb_id: {
            type: DataTypes.STRING,
            unique: true
        },
        title: DataTypes.STRING,
        release_date: DataTypes.STRING,
        length: DataTypes.INTEGER,
        overview: DataTypes.TEXT,
        plot_line: DataTypes.STRING,
        budget: DataTypes.BIGINT,
        cast_quantity: DataTypes.INTEGER,
        website: DataTypes.STRING,
        word_count: DataTypes.INTEGER,
        revenue: DataTypes.BIGINT,
        valid: DataTypes.BOOLEAN,
        poster_id: {type: DataTypes.INTEGER, references: {model: 'posters', key: 'id'}},
        story_origin_id: {type: DataTypes.INTEGER, references: {model: 'story_origins', key: 'id'}},
        type_id: {type: DataTypes.INTEGER, references: {model: 'movie_types', key: 'id'}},
        set_in_place_id: {type: DataTypes.INTEGER, references: {model: 'places', key: 'id'}},
        set_in_time_id: {type: DataTypes.INTEGER, references: {model: 'times', key: 'id'}}
    }, {});
    movie.associate = function (models) {
        movie.belongsTo(models.poster, {as: 'poster'});
        movie.belongsTo(models.story_origin, {as: 'story_origin'});
        movie.belongsTo(models.movie_type, {as: 'type'});
        movie.belongsTo(models.place, {as: 'set_in_place'});
        movie.belongsTo(models.time, {as: 'set_in_time'});

        movie.belongsToMany(models.genre, {
            through: 'movies_genres',
            as: 'genres',
            foreignKey: 'movie_id'
        });
        movie.belongsToMany(models.language, {
            through: 'movies_languages',
            as: 'languages',
            foreignKey: 'movie_id'
        });
        movie.belongsToMany(models.producer, {
            through: 'movies_producers',
            as: 'producers',
            foreignKey: 'movie_id'
        });
        movie.belongsToMany(models.restriction, {
            through: 'movies_restrictions',
            as: 'restrictions',
            foreignKey: 'movie_id'
        });
        movie.belongsToMany(models.person, {
            through: 'movies_characters',
            as: 'characters',
            foreignKey: 'movie_id'
        });
        movie.belongsToMany(models.person, {
            through: 'movies_writers',
            as: 'writers',
            foreignKey: 'movie_id'
        });
        movie.belongsToMany(models.person, {
            through: 'movies_directors',
            as: 'directors',
            foreignKey: 'movie_id'
        });
    };
    return movie;
};
