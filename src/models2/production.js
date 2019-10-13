module.exports = (sequelize, type) => {
    return sequelize.define('production', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING,
            unique: true
        },
        country: type.STRING
    }, {
        underscored: true
    })
};
