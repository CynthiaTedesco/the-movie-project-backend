'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'story_origins',
      [
        {
          name: 'Comic',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Novel',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Original',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Real event',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Remake',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Toys',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Sequel',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Prequel',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('story_origins', null, {})
  }
}
