'use strict';
module.exports = (sequelize, DataTypes) => {
    const restriction = sequelize.define('restriction', {
        name: DataTypes.STRING,
        country: DataTypes.STRING
    }, {});
    restriction.associate = function (models) {
        restriction.belongsToMany(models.movie, {
            through: 'movies_restrictions',
            as: 'movies',
            foreignKey: 'restriction_id'
        });
    };
    return restriction;
};
