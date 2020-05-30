"use strict";
module.exports = (sequelize, DataTypes) => {
  const distribution_company = sequelize.define(
    "distribution_company",
    {
      name: DataTypes.STRING,
      country: DataTypes.STRING,
    },
    {}
  );
  distribution_company.associate = function(models) {
    // associations can be defined here
  };
  return distribution_company;
};
