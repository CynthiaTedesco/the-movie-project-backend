'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('movies_directors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      movie_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        }
      },
      person_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'people',
          key: 'id'
        }
      },
      primary: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('movies_directors');
  }
};
