'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('times', [{
      name: 'Present',
      createdAt: new Date(),
      updatedAt: new Date()
    },
      {
        name: 'Past',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Future',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('times', null, {});
  }
};
