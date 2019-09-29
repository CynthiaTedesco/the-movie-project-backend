module.exports = (sequelize, type) => {
    return sequelize.define('genre', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        underscored: true
    })
};
