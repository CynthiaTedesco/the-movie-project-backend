'use strict';
module.exports = (sequelize, DataTypes) => {
  const story_origin = sequelize.define('story_origin', {
    name: DataTypes.STRING
  }, {});
  story_origin.associate = function(models) {
    // associations can be defined here
  };
  return story_origin;
};