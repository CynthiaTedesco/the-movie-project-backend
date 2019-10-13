module.exports = (sequelize, type) => {
    return sequelize.define('movie_language', {
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
        'language_id': {
            type: type.INTEGER,
            primaryKey: true,
            references: {
                model: 'languages',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        'primary': type.BOOLEAN
    }, {
        underscored: true
    })
};
