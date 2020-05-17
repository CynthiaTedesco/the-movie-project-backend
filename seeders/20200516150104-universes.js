'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'universes',
      [
        {
          name: 'Fantasy',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sci-Fi',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Real World',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('universes', null, {})
  },
}
