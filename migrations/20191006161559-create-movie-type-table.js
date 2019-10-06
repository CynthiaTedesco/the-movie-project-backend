'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
        'movie_type',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          createdAt: {
            type: Sequelize.DATE
          },
          updatedAt: {
            type: Sequelize.DATE
          },
          name: Sequelize.STRING,
        },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('movie_type');
  }
};
