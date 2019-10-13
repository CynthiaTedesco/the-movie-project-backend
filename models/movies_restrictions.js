'use strict';
module.exports = (sequelize, DataTypes) => {
    const movies_restrictions = sequelize.define('movies_restrictions', {
        movie_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'movie',
                key: 'id'
            }
        },
        restriction_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'restriction',
                key: 'id'
            }
        },
        primary: DataTypes.BOOLEAN
    }, {});
    movies_restrictions.associate = function (models) {
        // associations can be defined here
    };
    return movies_restrictions;
};
