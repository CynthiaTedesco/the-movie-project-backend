'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'character_types',
      [
        {
          name: 'Human',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Caregiver',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Hero',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Joker',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Lover',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Orphan',
          createdAt: new Date(),
          updatedAt: new Date()
        }, 
        {
          name: 'Rebel',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('character_types', null, {})
  }
}
