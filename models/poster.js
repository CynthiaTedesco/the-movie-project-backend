'use strict';
module.exports = (sequelize, DataTypes) => {
  const poster = sequelize.define('poster', {
    url: DataTypes.STRING,
    poster_type_id: DataTypes.INTEGER
  }, {});
  return poster;
};
