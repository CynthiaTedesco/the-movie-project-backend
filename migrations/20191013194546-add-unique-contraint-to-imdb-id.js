'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('movies', ['imdb_id'], {
      type: 'unique',
      name: 'imdb_id_unique_contraint'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('movies', 'imdb_id_unique_contraint');
  }
};
