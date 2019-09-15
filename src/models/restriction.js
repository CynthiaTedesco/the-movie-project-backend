module.exports = (sequelize, type) => {
    return sequelize.define('restriction', {
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
