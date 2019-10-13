'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('movies_produces', 'movies_producers')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable('movies_producers', 'movies_produces')
  }
};
