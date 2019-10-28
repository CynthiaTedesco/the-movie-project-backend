'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('poster', {
    url: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    poster_type_id: DataTypes.INTEGER
  }, {});
};
