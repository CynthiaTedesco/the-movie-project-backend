'use strict';
module.exports = (sequelize, DataTypes) => {
  const poster_type = sequelize.define('poster_type', {
    name: DataTypes.STRING
  }, {});
  poster_type.associate = function(models) {
    // associations can be defined here
  };
  return poster_type;
};