module.exports = (sequelize, type) => {
    return sequelize.define('poster_type', {
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
