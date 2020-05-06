'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('movies', 'tmdb_id', {
      type: Sequelize.INTEGER,
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('movies', 'tmdb_id')
  },
}
