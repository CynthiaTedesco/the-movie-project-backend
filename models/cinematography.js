'use strict';
module.exports = (sequelize, DataTypes) => {
  const cinematography = sequelize.define('cinematography', {
    name: DataTypes.STRING
  }, {});
  cinematography.associate = function(models) {
    // associations can be defined here
  };
  return cinematography;
};