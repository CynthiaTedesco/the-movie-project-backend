'use strict';
module.exports = (sequelize, DataTypes) => {
  const character_type = sequelize.define('character_type', {
    name: DataTypes.STRING
  }, {});
  character_type.associate = function(models) {
    // associations can be defined here
  };
  return character_type;
};