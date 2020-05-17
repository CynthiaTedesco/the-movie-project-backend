'use strict';
module.exports = (sequelize, DataTypes) => {
  const serie = sequelize.define('serie', {
    name: DataTypes.STRING
  }, {});
  serie.associate = function(models) {
    // associations can be defined here
  };
  return serie;
};