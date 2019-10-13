'use strict';
module.exports = (sequelize, DataTypes) => {
    const person = sequelize.define('person', {
        name: DataTypes.STRING,
        date_of_birth: DataTypes.STRING,
        gender: DataTypes.STRING
    }, {});
    person.associate = function (models) {
        person.belongsToMany(models.movie, {
            through: 'movies_characters',
            as: 'characters',
            foreignKey: 'person_id'
        });
        person.belongsToMany(models.movie, {
            through: 'movies_writers',
            as: 'writers',
            foreignKey: 'person_id'
        });
        person.belongsToMany(models.movie, {
            through: 'movies_directors',
            as: 'directors',
            foreignKey: 'person_id'
        });
    };
    return person;
};
