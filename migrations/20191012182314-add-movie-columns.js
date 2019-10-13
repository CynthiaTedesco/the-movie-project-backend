'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('movies', 'poster', {type: Sequelize.INTEGER, references: {model:'posters', key:'id'}}),
      queryInterface.addColumn('movies', 'story_origin', {type: Sequelize.INTEGER, references: {model:'story_origins', key:'id'}}),
      queryInterface.addColumn('movies', 'type', {type: Sequelize.INTEGER, references: {model:'movie_types', key:'id'}}),
      queryInterface.addColumn('movies', 'set_in_place', {type: Sequelize.INTEGER, references: {model:'places', key:'id'}}),
      queryInterface.addColumn('movies', 'set_in_time', {type: Sequelize.INTEGER, references: {model:'times', key:'id'}}),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('movies', 'poster'),
      queryInterface.removeColumn('movies', 'story_origin'),
      queryInterface.removeColumn('movies', 'type'),
      queryInterface.removeColumn('movies', 'set_in_place'),
      queryInterface.removeColumn('movies', 'set_in_time')
    ]);
  }
};
