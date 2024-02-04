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
  host: '0.0.0.0', // for local use
  // host: "mysql1", // for docker use 
  port: '3306',
  user: 'root',
  password: 'Yusufcme',

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
        password VARCHAR(255) NOT NULL,
        rating INT
      )`, (err) => {
        if (err) throw err;
        console.log('Database and table created or already exist');
      });
  });
});




app.post('/createChatTable', (req, res) => {
    const { chatTableName } = req.body;
  
    if (!chatTableName) {
      return res.status(400).json({ error: 'Chat table name is required' });
    }
  
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${chatTableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        image_path VARCHAR(255),  
        parent_id INT,
        thumbs_up INT DEFAULT 0,
        thumbs_down INT DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_id) REFERENCES ${chatTableName}(id)
      )`;
  
    connection.query(createTableSQL, (err) => {
      if (err) {
        console.error(`Error creating chat table '${chatTableName}':`, err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      console.log(`Chat table '${chatTableName}' created or already exists`);
      res.status(200).json({ message: `Chat table '${chatTableName}' created or already exists` });
    });
  });




  app.delete('/deleteObject/:tableName/:objectId', (req, res) => {
    const { tableName, objectId } = req.params;
  
    if (!tableName || !objectId) {
      return res.status(400).json({ error: 'Table name and object ID are required' });
    }
  
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
  
    connection.query(deleteQuery, [objectId], (err, result) => {
      if (err) {
        console.error(`Error deleting object from ${tableName} with ID ${objectId}:`, err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Object not found' });
      }
  
      res.status(200).json({ message: `Object deleted from ${tableName} with ID ${objectId}` });
    });
  });








// Sign-up Route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Check if the username already exists
  const checkUserSql = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUserSql, [username], (err, result) => {
    if (err) {
      console.error('Error checking username existence:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      // User with the same username already exists
      return res.status(409).json({ error: 'User with the same username already exists' });
    }

    // If the username doesn't exist, proceed to create the user
    const createUserSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(createUserSql, [username, password], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Drop current_user table if it exists
      const dropTableSql = 'DROP TABLE IF EXISTS currentUser';
      connection.query(dropTableSql, (err) => {
        if (err) {
          console.error('Error dropping currentUser table:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Create the current_user table
        const createTableSql = 'CREATE TABLE currentUser (id VARCHAR(255), rating INT)';
        connection.query(createTableSql, (err) => {
          if (err) {
            console.error('Error creating current_user table:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Insert the username into the current_user table
          const insertSql = 'INSERT INTO currentUser (id) VALUES (?)';
          connection.query(insertSql, [username], (err, result) => {
            if (err) {
              console.error('Error inserting into current_user table:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            console.log('Username inserted into current_user table successfully');
            res.status(200).json({ message: 'User created and inserted into current_user table successfully' });
          });
        });
      });
    });
  });
});




app.post('/api/dropTable', (req, res) => {
  const { tableName } = req.body;

  if (!tableName) {
    return res.status(400).json({ message: 'Table name is required in the request body' });
  }

  const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;

  connection.query(dropTableQuery, (err, result) => {
    if (err) {
      console.error('Error dropping table:', err);
      return res.status(500).json({ message: 'Error dropping table' });
    }

    res.json({ message: `Table '${tableName}' dropped successfully` });
  });
});






app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Check for special credentials
  if (username === 'Yusuf' && password === 'CME') {
    // Send a custom message to the front end for specific credentials
    console.log('Special credentials detected: Yusuf and CME');
    return res.status(200).json({ message: 'Admin' });
  }
  

  // Check user credentials
  const checkCredentialsSql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(checkCredentialsSql, [username, password], (err, result) => {
    if (err) {
      console.error('Error checking user credentials:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      // User authenticated successfully
      const existingUser = result[0];
      const updatedRating = existingUser.rating + 1;

      // Increment the user's rating in the users table
      const updateRatingSql = 'UPDATE users SET rating = ? WHERE username = ?';
      connection.query(updateRatingSql, [updatedRating, username], (err, result) => {
        if (err) {
          console.error('Error updating rating:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('User rating incremented successfully');

        // Drop current_user table if it exists
        const dropTableSql = 'DROP TABLE IF EXISTS currentUser';
        connection.query(dropTableSql, (err) => {
          if (err) {
            console.error('Error dropping currentUser table:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Create the current_user table
          const createTableSql = 'CREATE TABLE currentUser (id VARCHAR(255), rating INT)';
          connection.query(createTableSql, (err) => {
            if (err) {
              console.error('Error creating current_user table:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Insert username and rating into current_user table
            const insertSql = 'INSERT INTO currentUser (id, rating) VALUES (?, ?)';
            connection.query(insertSql, [username, updatedRating], (err) => {
              if (err) {
                console.error('Error inserting into currentUser table:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
              }

              console.log('User authenticated successfully, and data inserted into current_user table');
              res.status(200).json({ message: 'User authenticated successfully', rating: updatedRating });
            });
          });
        });
      });
    } else {
      console.log('Invalid username or password');
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});










// Rating Route
app.get('/rating', (req, res) => {
  // Fetch the rating from the currentUser table
  const fetchRatingSql = 'SELECT rating FROM currentUser LIMIT 1';
  connection.query(fetchRatingSql, (err, result) => {
    if (err) {
      console.error('Error fetching rating:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const rating = result.length > 0 ? result[0].rating : 0;
    res.json({ rating });
  });
});





  // Get Current User Route
app.get('/currentUser', (req, res) => {
    // Query the current_user table to get the current user's name
    const getCurrentUserSql = 'SELECT * FROM currentuser';
  
    connection.query(getCurrentUserSql, (err, result) => {
      if (err) {
        console.error('Error getting current user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (result.length > 0) {
        const currentUser = result[0].id;
        res.status(200).json({ current_user: currentUser });
      } else {
        res.status(404).json({ error: 'Current user not found' });
      }
    });
  });




app.get('/getAllTables', (req, res) => {
    connection.query('SHOW TABLES', (err, result) => {
      if (err) {
        console.error('Error retrieving all tables:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const tables = result.map((row) => Object.values(row)[0]);
  
      const allTablesData = [];
  
      // Fetch content for each table
      const fetchTableDataPromises = tables.map((tableName) => {
        return new Promise((resolve) => {
          connection.query(`SELECT * FROM ${tableName}`, (err, result) => {
            if (err) {
              console.error(`Error retrieving data from table ${tableName}:`, err);
              resolve({ tableName, error: 'Error fetching data' });
            } else {
              resolve({ tableName, data: result });
            }
          });
        });
      });
  
      // Wait for all table data to be fetched
      Promise.all(fetchTableDataPromises)
        .then((tableData) => {
          res.status(200).json({ tables: tableData });
        })
        .catch((error) => {
          console.error('Error fetching table data:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
  });


  // Get All Chats Route
app.get('/getAllChats', (req, res) => {
    connection.query('SHOW TABLES', (err, result) => {
      if (err) {
        console.error('Error retrieving all chat tables:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      // Filter out tables you want to exclude ('users' and 'current_user' in this case)
      const excludedTables = ['users', 'currentUser'];
  
      // Filter out the excluded tables from the result
      const chatTables = result
        .map((row) => row[`Tables_in_gethelp`])
        .filter((tableName) => !excludedTables.includes(tableName));
  
      res.status(200).json({ chatTables });
    });
  });

  app.get('/getChatHistory/:channelName', (req, res) => {
    const { channelName } = req.params;

  
    connection.query(`SELECT * FROM ${channelName}`, (err, result) => {
      if (err) {
        console.error(`Error retrieving chat history for channel '${channelName}':`, err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const chatHistory = result;
      res.status(200).json({ chatHistory });
    });
  });

  // Add Comment Endpoint
  app.post('/addComment/:chatTableName', (req, res) => {
    const { chatTableName } = req.params;
    const { user_id, message, parent_id } = req.body;
  
    if (!user_id || !message) {
      return res.status(400).json({ error: 'User ID and message are required' });
    }
  
    const addCommentSQL = `
      INSERT INTO ${chatTableName} (user_id, message, parent_id) 
      VALUES (?, ?, ?)`;
  
    connection.query(addCommentSQL, [user_id, message, parent_id], (err, result) => {
      if (err) {
        console.error(`Error adding comment to '${chatTableName}':`, err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      console.log('Comment added successfully:', result);
      res.status(200).json({ message: 'Comment added successfully', commentId: result.insertId });
    });
  });
  
  // Add Reply Endpoint
  app.post('/addReply/:commentId', (req, res) => {
    const { chatTableName } = req.params;
    const { commentId } = req.params;
    const { text, image } = req.body;
  
    const sql = 'INSERT INTO ${chatTableName} (comment_id, text, image) VALUES (?, ?, ?)';
    const values = [commentId, text, image];
  
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error adding reply:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({ message: 'Reply added successfully' });
    });
  });
  
  // Update Reaction Endpoint
  app.post('/updateReaction/:commentId', (req, res) => {
    const { commentId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
  
    const sql = `UPDATE comments SET ${type}s = ${type}s + 1 WHERE id = ?`;
    const values = [commentId];
  
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error updating reaction:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({ message: 'Reaction updated successfully' });
    });
  });

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);