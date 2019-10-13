'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('movies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      awards: {
        type: Sequelize.STRING
      },
      box_office: {
        type: Sequelize.BIGINT
      },
      imdb_rating: {
        type: Sequelize.STRING
      },
      imdb_id: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      release_date: {
        type: Sequelize.STRING
      },
      length: {
        type: Sequelize.INTEGER
      },
      overview: {
        type: Sequelize.TEXT
      },
      plot_line: {
        type: Sequelize.STRING
      },
      budget: {
        type: Sequelize.BIGINT
      },
      cast_quantity: {
        type: Sequelize.INTEGER
      },
      website: {
        type: Sequelize.STRING
      },
      word_count: {
        type: Sequelize.INTEGER
      },
      revenue: {
        type: Sequelize.BIGINT
      },
      valid: {
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
    return queryInterface.dropTable('movies');
  }
};