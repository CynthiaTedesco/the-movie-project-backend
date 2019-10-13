'use strict';
module.exports = (sequelize, DataTypes) => {
  const poster = sequelize.define('poster', {
    url: DataTypes.STRING,
    poster_type_id: DataTypes.INTEGER
  }, {});
  poster.associate = function(models) {
    poster.belongsTo(models.movies);
  };
  return poster;
};
