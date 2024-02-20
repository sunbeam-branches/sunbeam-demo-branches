const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const config = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB,
});

// Create a JWT secret key
const JWT_SECRET_KEY = "your_secret_key";

app.use(bodyParser.json());

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }
  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token." });
    }
    req.userId = decoded.id;
    next();
  });
}

// CRUD operations

// Create a new user
app.post("/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Failed to create user." });
        }
        res.status(201).json({ message: "User created successfully." });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Authenticate user and generate JWT token
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error." });
        }
        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid email or password." });
        }
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid email or password." });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);
        res.status(200).json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get user profile (protected route)
app.get("/users/profile", verifyToken, (req, res) => {
  pool.query(
    "SELECT id, username, email FROM users WHERE id = ?",
    [req.userId],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }
      const user = results[0];
      res.json(user);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
