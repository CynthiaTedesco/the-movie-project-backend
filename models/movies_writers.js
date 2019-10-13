'use strict';
module.exports = (sequelize, DataTypes) => {
  const movies_writers = sequelize.define('movies_writers', {
    movie_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'movie',
        key: 'id'
      }
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    detail: DataTypes.STRING,
    primary: DataTypes.BOOLEAN
  }, {});
  movies_writers.associate = function(models) {
    // associations can be defined here
  };
  return movies_writers;
};
