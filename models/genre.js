'use strict';
module.exports = (sequelize, DataTypes) => {
  const genre = sequelize.define('genre', {
    name: DataTypes.STRING
  }, {});
  genre.associate = function(models) {
    genre.belongsToMany(models.movie, {
      through: 'movies_genres',
      as: 'movies',
      foreignKey: 'genre_id'
    });
  };
  return genre;
};
