'use strict';
module.exports = (sequelize, DataTypes) => {
  const movies_languages = sequelize.define('movies_languages', {
    movie_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'movie',
        key: 'id'
      }
    },
    language_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'language',
        key: 'id'
      }
    },
    primary: DataTypes.BOOLEAN
  }, {});
  movies_languages.associate = function(models) {
    // associations can be defined here
  };
  return movies_languages;
};
