"use strict";
module.exports = (sequelize, DataTypes) => {
  const poster = sequelize.define(
    "poster",
    {
      url: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      poster_type_id: DataTypes.INTEGER,
    },
    {}
  );
  poster.associate = function(models) {
    poster.belongsTo(models.poster_type, {
      as: "poster_type",
      foreignKey: "poster_type_id",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return poster;
};
