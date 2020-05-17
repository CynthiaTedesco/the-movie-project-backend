'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('movies', 'universe_id', {type: Sequelize.INTEGER, references: {model:'universes', key:'id'}}),
      queryInterface.addColumn('movies', 'serie_id', {type: Sequelize.INTEGER, references: {model:'series', key:'id'}}),
      queryInterface.addColumn('movies', 'cinematography_id', {type: Sequelize.INTEGER, references: {model:'cinematographies', key:'id'}}),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('movies', 'cinematography_id'),
      queryInterface.removeColumn('movies', 'serie_id'),
      queryInterface.removeColumn('movies', 'universe_id'),
    ])
  }
};
