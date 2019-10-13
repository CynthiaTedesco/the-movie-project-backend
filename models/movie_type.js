'use strict';
module.exports = (sequelize, DataTypes) => {
  const movie_type = sequelize.define('movie_type', {
    name: DataTypes.STRING
  }, {});
  movie_type.associate = function(models) {
    // associations can be defined here
  };
  return movie_type;
};