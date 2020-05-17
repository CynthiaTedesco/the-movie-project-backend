'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'series',
      [
        {
          name: 'Remake',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sequel',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Prequel',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'New',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('series', null, {})
  },
}
