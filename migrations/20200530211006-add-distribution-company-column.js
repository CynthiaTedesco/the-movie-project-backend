'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('movies', 'distribution_company_id', {type: Sequelize.INTEGER, references: {model:'distribution_companies', key:'id'}})
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('movies', 'distribution_company_id'),
    ])
  }
};
