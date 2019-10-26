'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('languages', ['code', 'name'], {
      type: 'unique',
      name: 'language_unique_constraint'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('languages', 'language_unique_constraint')
  }
};
