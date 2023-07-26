const express = require("express");
const bodyParser = require("body-parser");
const userController = require("./userController");
const sequelize = require("./db"); // Import the sequelize instance

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

app.use("/api", userController);
app.get("/", (req, res) => {
  res.send("Welcome to the User Management API!");
});

// Start the server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
