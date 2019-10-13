module.exports = (sequelize, type) => {
    return sequelize.define('movie_restriction', {
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
        'restriction_id': {
            type: type.INTEGER,
            primaryKey: true,
            references: {
                model: 'restrictions',
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
