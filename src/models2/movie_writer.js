'use strict';
module.exports = (sequelize, DataTypes) => {
  const movie_writer = sequelize.define('movie_writer', {
    movie_id: DataTypes.BIGINT,
    person_id: DataTypes.BIGINT,
    primary: DataTypes.BOOLEAN
  }, {});
  movie_writer.associate = function(models) {
    // associations can be defined here
  };
  return movie_writer;
};