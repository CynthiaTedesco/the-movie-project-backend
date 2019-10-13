module.exports = (sequelize, type) => {
    return sequelize.define('poster', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        url: type.STRING,
        type: {
            type: type.BIGINT
        }
    }, {
        underscored: true
    })
};
