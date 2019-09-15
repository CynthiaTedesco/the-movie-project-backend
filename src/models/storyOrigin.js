//based on book / original
module.exports = (sequelize, type) => {
    return sequelize.define('story_origin', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: type.STRING
    }, {
        underscored: true
    })
};
