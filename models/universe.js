'use strict';
module.exports = (sequelize, DataTypes) => {
  const universe = sequelize.define('universe', {
    name: DataTypes.STRING
  }, {});
  universe.associate = function(models) {
    // associations can be defined here
  };
  return universe;
};