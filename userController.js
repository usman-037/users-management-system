const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { User, Log } = require("./userModel");

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.create({ name, email, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Retrieve all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({ where: { archived: false } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retrieve a user by email
router.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const user = await User.findOne({ where: { email, archived: false } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user by ID
router.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    if (user) {
      const { name, email, role } = req.body;
      user.name = name;
      user.email = email;
      user.role = role;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Archive a user by ID
router.put("/users/archive/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    if (user) {
      user.archived = true;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retrieve users of a specific role
router.get("/users/role/:role", async (req, res) => {
  const role = req.params.role;
  try {
    const users = await User.findAll({ where: { role } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user by ID
router.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      res.json({ message: "User deleted successfully." });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retrieve users whose name contains specific letters
router.get("/users-searchName", async (req, res) => {
  const letters = req.query.name;
  try {
    const users = await User.findAll({
      where: {
        name: {
          [Op.like]: `%${letters}%`,
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retrieve users whose email includes specific letters
router.get("/users-searchEmail", async (req, res) => {
  const letters = req.query.email;
  try {
    const users = await User.findAll({
      where: {
        email: {
          [Op.like]: `%${letters}%`,
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Retrieve all archived users
router.get("/users-archived", async (req, res) => {
  try {
    const archivedUsers = await User.findAll({
      where: {
        archived: true,
      },
    });
    res.json(archivedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Log user login/logout
router.post("/users/:email/log", async (req, res) => {
  const email = req.params.email;
  const { action, timestamp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const log = await Log.create({ action, timestamp });
    await user.addLog(log);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logs of a specific user by email
router.get("/users/:email/logs", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const logs = await user.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get 5 recent logs of a user
router.get("/users/:email/logs/recent", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const logs = await Log.findAll({
      where: { UserId: user.id },
      order: [["timestamp", "DESC"]],
      limit: 5,
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a specific log by ID
router.delete("/logs/:id", async (req, res) => {
  const logId = req.params.id;

  try {
    const log = await Log.findByPk(logId);
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    await log.destroy();
    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
