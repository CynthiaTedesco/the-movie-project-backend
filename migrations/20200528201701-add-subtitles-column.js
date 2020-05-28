'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('movies', 'subtitles', {type: Sequelize.BLOB}),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('movies', 'subtitles'),
    ])
  }
};
