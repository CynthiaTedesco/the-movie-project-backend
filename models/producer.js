'use strict';
module.exports = (sequelize, DataTypes) => {
  const producer = sequelize.define('producer', {
    name: {
      type: DataTypes.STRING,
      unique:true
    },
    country: DataTypes.STRING
  }, {});
  producer.associate = function(models) {
    producer.belongsToMany(models.movie, {
      through: 'movies_producers',
      as: 'movies',
      foreignKey: 'producer_id'
    });
  };
  return producer;
};
