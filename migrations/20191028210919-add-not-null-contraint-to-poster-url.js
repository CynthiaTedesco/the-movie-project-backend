'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('posters', 'url', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('posters', 'url', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    });
  }
};
