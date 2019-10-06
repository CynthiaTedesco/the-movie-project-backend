'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('movies', 'awards', Sequelize.STRING),
            queryInterface.addColumn('movies', 'type', Sequelize.INTEGER),
            queryInterface.addColumn('movies', 'box_office', Sequelize.BIGINT),
            queryInterface.addColumn('movies', 'imdb_rating', Sequelize.STRING)
        ]);
    },

    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn('movies', 'awards'),
            queryInterface.removeColumn('movies', 'type'),
            queryInterface.removeColumn('movies', 'box_office'),
            queryInterface.removeColumn('movies', 'imdb_rating')
        ]);

    }
};
