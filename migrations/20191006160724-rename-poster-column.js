'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('movies', 'poster_id'),
            queryInterface.renameColumn('movies', 'story_origin_id', 'story_origin'),
            queryInterface.renameColumn('movies', 'main_character_id', 'main_character')
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('movies', 'poster_id', Sequelize.INTEGER),
            queryInterface.renameColumn('movies', 'story_origin', 'story_origin_id'),
            queryInterface.renameColumn('movies', 'main_character', 'main_character_id')
        ]);
    }
};
