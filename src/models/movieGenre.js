module.exports = (sequelize, type) => {
    return sequelize.define('movie_genre', {
        'movie_id': {
            type: type.INTEGER,
            primaryKey: true,
            references: {
                model: 'movies',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        'genre_id': {
            type: type.INTEGER,
            primaryKey: true,
            references: {
                model: 'genres',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        'primary': {
            type: type.BOOLEAN,
            defaultValue: false

        }
    }, {
        underscored: true
    })
};
