'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('movies_characters', 'type', {type: Sequelize.INTEGER, references: {model:'character_types', key:'id'}});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('movies_characters', 'type');
  }
};
