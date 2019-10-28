'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('movies', 'poster', 'poster_id'),
      queryInterface.renameColumn('movies', 'story_origin', 'story_origin_id'),
      queryInterface.renameColumn('movies', 'type', 'type_id'),
      queryInterface.renameColumn('movies', 'set_in_place', 'set_in_place_id'),
      queryInterface.renameColumn('movies', 'set_in_time', 'set_in_time_id'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('movies', 'poster_id', 'poster'),
      queryInterface.renameColumn('movies', 'story_origin_id', 'story_origin'),
      queryInterface.renameColumn('movies', 'type_id', 'type'),
      queryInterface.renameColumn('movies', 'set_in_place_id', 'set_in_place'),
      queryInterface.renameColumn('movies', 'set_in_time_id', 'set_in_time'),
    ]);
  },
};
