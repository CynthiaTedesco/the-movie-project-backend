'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('story_origins', [{
            name: 'Sequel',
            createdAt: new Date(),
            updatedAt: new Date()
        },
            {
                name: 'Prequel',
                createdAt: new Date(),
                updatedAt: new Date()
            }], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('story_origins', null, {});
    }
};
