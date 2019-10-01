module.exports = (sequelize, type) => {
    return sequelize.define('language', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: type.STRING,
        code: {
            type: type.STRING,
            unique: true
        }
    }, {
        underscored: true
    })
};
