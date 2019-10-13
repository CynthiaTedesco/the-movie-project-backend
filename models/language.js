'use strict';
module.exports = (sequelize, DataTypes) => {
  const language = sequelize.define('language', {
    name: DataTypes.STRING,
    code: {
      type: DataTypes.STRING,
      unique:true
    }
  }, {});
  language.associate = function(models) {
    language.belongsToMany(models.movie, {
      through: 'movies_languages',
      as: 'movies',
      foreignKey: 'language_id'
    });
  };
  return language;
};
