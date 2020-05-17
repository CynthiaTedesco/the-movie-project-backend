'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'cinematographies',
      [
        {
          name: 'Live Action',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Animation',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('cinematographies', null, {})
  },
}
