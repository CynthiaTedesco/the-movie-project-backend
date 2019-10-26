'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('producers', ['name'], {
      type: 'unique',
      name: 'producer_unique_constraint'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('producers', 'producer_unique_constraint')
  }
};
