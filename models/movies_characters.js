'use strict';
module.exports = (sequelize, DataTypes) => {
  const movies_characters = sequelize.define('movies_characters', {
    movie_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'movie',
        key: 'id'
      }
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    main: DataTypes.BOOLEAN,
    character_name: DataTypes.STRING
  }, {});
  movies_characters.associate = function(models) {
    // associations can be defined here
  };
  return movies_characters;
};
