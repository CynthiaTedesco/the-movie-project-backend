module.exports = (sequelize, type) => {
    return sequelize.define('production', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: type.STRING,
        country: type.STRING
    }, {
        underscored: true
    })
};
