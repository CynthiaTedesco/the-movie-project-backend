'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('posters', ['url'], {
      type: 'unique',
      name: 'poster_unique_url_constraint'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('posters', 'poster_unique_url_constraint')
  }
};
