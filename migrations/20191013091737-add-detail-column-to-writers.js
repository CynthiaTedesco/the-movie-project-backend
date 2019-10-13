'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('movies_writers', 'detail', {type: Sequelize.STRING});
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('movies_writers', 'detail');
  }
};
