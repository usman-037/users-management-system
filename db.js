const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("usman", "root", "", {
  host: "localhost",
  dialect: "mysql",
});
module.exports = sequelize;
