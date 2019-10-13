'use strict';
module.exports = (sequelize, DataTypes) => {
  const movies_directors = sequelize.define('movies_directors', {
    movie_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id'
      }
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'people',
        key: 'id'
      }
    },
    primary: DataTypes.BOOLEAN
  }, {});
  movies_directors.associate = function(models) {
    // associations can be defined here
  };
  return movies_directors;
};
