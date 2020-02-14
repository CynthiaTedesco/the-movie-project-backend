'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'poster_types',
      [
        {
          name: 'Head montage',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Cars',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Mid-action shot',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Single Figure',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Strike a pose',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('poster_types', null, {})
  }
}
