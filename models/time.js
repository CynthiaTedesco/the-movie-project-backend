'use strict';
module.exports = (sequelize, DataTypes) => {
  const time = sequelize.define('time', {
    name: DataTypes.STRING
  }, {});
  time.associate = function(models) {
    // associations can be defined here
  };
  return time;
};