module.exports = (sequelize, type) => {
    return sequelize.define('movie_type', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING,
            allowNull: false,
            unique: true
        },
        gender: type.STRING,
        date_of_birth: type.STRING
    }, {
        underscored: true
    })
};
