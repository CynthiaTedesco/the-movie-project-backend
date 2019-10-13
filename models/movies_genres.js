'use strict';
module.exports = (sequelize, DataTypes) => {
  const movies_genres = sequelize.define('movies_genres', {
    movie_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'movie',
        key: 'id'
      }
    },
    genre_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'genre',
        key: 'id'
      }
    },
    primary: DataTypes.BOOLEAN
  }, {});
  movies_genres.associate = function(models) {
    // associations can be defined here
  };
  return movies_genres;
};
