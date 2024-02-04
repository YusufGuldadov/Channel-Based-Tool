const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');



const PORT = 3001;
const HOST = '0.0.0.0';
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Database Connection
const connection = mysql.createConnection({
  host: '0.0.0.0',
  port: '3306',
  user: 'root',
  password: 'Yusufcme',
  //database: 'your_database_name', // Replace with your actual database name
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Server!');
});

// Create database and users table
connection.query('CREATE DATABASE IF NOT EXISTS gethelp', (err) => {
  if (err) throw err;
  connection.query('USE gethelp', (err) => {
    if (err) throw err;
    connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )`, (err) => {
        if (err) throw err;
        console.log('Database and table created or already exist');
      });
  });
});


// Sign-up Route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log('User created successfully');
    res.status(200).json({ message: 'User created successfully' });
  });
});

// Sign-in Route
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error checking user credentials:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      console.log('User authenticated successfully');
      res.status(200).json({ message: 'User authenticated successfully' });
    } else {
      console.log('Invalid username or password');
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);