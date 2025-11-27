const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wasteManagement',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running', status: 'ok' });
});

// Areas endpoints
app.get('/areas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Area ORDER BY area_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/areas', async (req, res) => {
  try {
    const { area_name, description } = req.body;
    console.log('Creating area:', { area_name, description });
    if (!area_name) {
      return res.status(400).json({ success: false, error: 'Area name is required' });
    }
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Area (area_name, description) VALUES (?, ?)', [area_name, description || '']);
    connection.release();
    console.log('Area created successfully');
    res.json({ success: true, message: 'Area created successfully' });
  } catch (error) {
    console.error('Error creating area:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/areas/:id', async (req, res) => {
  try {
    const { area_name, description } = req.body;
    const connection = await pool.getConnection();
    await connection.query('UPDATE Area SET area_name = ?, description = ? WHERE area_id = ?', [area_name, description, req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Area updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/areas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM Area WHERE area_id = ?', [req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Area deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Citizens endpoints
app.get('/citizens', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Citizen ORDER BY citizen_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/citizens', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Citizen (name, email, phone) VALUES (?, ?, ?)', [name, email, phone]);
    connection.release();
    res.json({ success: true, message: 'Citizen created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/citizens/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM Citizen WHERE citizen_id = ?', [req.params.id]);
    connection.release();
    res.json({ success: true, message: 'Citizen deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bills endpoints
app.get('/bills', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Bill ORDER BY bill_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/bills', async (req, res) => {
  try {
    const { citizen_id, amount, status } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Bill (citizen_id, amount, status) VALUES (?, ?, ?)', [citizen_id, amount, status || 'Pending']);
    connection.release();
    res.json({ success: true, message: 'Bill created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Waste endpoints
app.get('/waste', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Waste ORDER BY waste_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/waste', async (req, res) => {
  try {
    const { area_id, category, quantity } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Waste (area_id, category, quantity) VALUES (?, ?, ?)', [area_id, category, quantity]);
    connection.release();
    res.json({ success: true, message: 'Waste record created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Payments endpoints
app.get('/payments', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Payment ORDER BY payment_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/payments', async (req, res) => {
  try {
    const { bill_id, amount } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Payment (bill_id, amount) VALUES (?, ?)', [bill_id, amount]);
    connection.release();
    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bins endpoints
app.get('/bins', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Bins ORDER BY bin_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/bins', async (req, res) => {
  try {
    const { area_id, bin_type, fill_level } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Bins (area_id, bin_type, fill_level) VALUES (?, ?, ?)', [area_id, bin_type, fill_level || 0]);
    connection.release();
    res.json({ success: true, message: 'Bin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crew endpoints
app.get('/crew', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Crew ORDER BY crew_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/crew', async (req, res) => {
  try {
    const { crew_name, role } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Crew (crew_name, role) VALUES (?, ?)', [crew_name, role]);
    connection.release();
    res.json({ success: true, message: 'Crew member created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedules endpoints
app.get('/schedules', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM Collection_Schedule ORDER BY schedule_id DESC');
    connection.release();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/schedules', async (req, res) => {
  try {
    const { area_id, schedule_day, schedule_time } = req.body;
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO Collection_Schedule (area_id, schedule_day, schedule_time) VALUES (?, ?, ?)', [area_id, schedule_day, schedule_time]);
    connection.release();
    res.json({ success: true, message: 'Schedule created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
