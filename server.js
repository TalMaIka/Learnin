const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres', // change this
  host: 'localhost',
  database: 'postgres',
  password: '123123a', // change this
  port: 5432,
});



app.get('/register', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Register</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: white;
            padding: 30px 40px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 320px;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 24px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
          }
          input[type="text"],
          input[type="email"],
          input[type="password"],
          select {
            width: 100%;
            padding: 8px 10px;
            margin-bottom: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
          }
          button {
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            border: none;
            border-radius: 4px;
            color: white;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #0056b3;
          }
          p.note {
            font-size: 12px;
            color: #999;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Register</h1>
          <form method="POST" action="/register">
            <label>Full Name:</label>
            <input type="text" name="full_name" required />

            <label>Email:</label>
            <input type="email" name="email" required />

            <label>Password:</label>
            <input type="password" name="password" required />

            <label>Role:</label>
            <select name="role" required>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit">Register</button>
          </form>
          <p class="note">
            Note: This form submits URL-encoded data, but your /register POST expects JSON. Adjust backend accordingly.
          </p>
        </div>
      </body>
    </html>
  `);
});

app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: white;
            padding: 30px 40px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 320px;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 24px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
          }
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 8px 10px;
            margin-bottom: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
          }
          button {
            width: 100%;
            padding: 10px;
            background-color: #28a745;
            border: none;
            border-radius: 4px;
            color: white;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          button:hover {
            background-color: #1e7e34;
          }
          p.note {
            font-size: 12px;
            color: #999;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Login</h1>
          <form method="POST" action="/login">
            <label>Email:</label>
            <input type="email" name="email" required />

            <label>Password:</label>
            <input type="password" name="password" required />

            <button type="submit">Login</button>
          </form>
          <p class="note">
            Note: This form submits URL-encoded data, but your /login POST expects JSON. Adjust backend accordingly.
          </p>
        </div>
      </body>
    </html>
  `);
});



// Register endpoint
app.post('/register', async (req, res) => {
  // Accept either JSON or URL-encoded form data
  const { email, password, full_name, role } = req.body;

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).send('Invalid role');
  }

  if (!email || !password || !full_name) {
    return res.status(400).send('Missing fields');
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4)`,
      [email, hash, full_name, role]
    );
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).send('User not found');

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Wrong password');

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
      }
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Backend running on http://0.0.0.0:3001');
});