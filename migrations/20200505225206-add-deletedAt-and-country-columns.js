'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('movies', 'country', {type: Sequelize.STRING}),
      queryInterface.addColumn('movies', 'deletedAt', {type: Sequelize.DATE}),
    ]);
    
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('movies', 'country'),
      queryInterface.removeColumn('movies', 'deletedAt'),
    ]);
  }
};
