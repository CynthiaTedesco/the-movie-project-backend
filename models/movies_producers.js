'use strict';
module.exports = (sequelize, DataTypes) => {
  const movies_producers = sequelize.define('movies_producers', {
    movie_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'movie',
        key: 'id'
      }
    },
    producer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'producer',
        key: 'id'
      }
    },
    primary: DataTypes.BOOLEAN
  }, {});
  movies_producers.associate = function(models) {
    // associations can be defined here
  };
  return movies_producers;
};
