'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('movies', 'most_used_word', {type: Sequelize.STRING});
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('movies', 'most_used_word');
  }
};
