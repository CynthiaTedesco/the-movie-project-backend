module.exports = (sequelize, type) => {
    return sequelize.define('movie_production', {
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
        'production_id': {
            type: type.INTEGER,
            primaryKey: true,
            references: {
                model: 'productions',
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
