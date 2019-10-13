'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('restrictions', ['name'], {
      type: 'unique',
      name: 'restriction_name_unique_contraint'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('restrictions', 'restriction_name_unique_contraint');
  }
};
