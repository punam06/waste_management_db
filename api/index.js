const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wasteManagement',
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Areas endpoints
app.get('/areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Area" ORDER BY area_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/areas', async (req, res) => {
  try {
    const { area_name, description } = req.body;
    if (!area_name) {
      return res.status(400).json({ success: false, error: 'Area name is required' });
    }
    await pool.query('INSERT INTO "Area" (area_name, description) VALUES ($1, $2)', [area_name, description]);
    res.json({ success: true, message: 'Area created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/areas/:id', async (req, res) => {
  try {
    const { area_name, description } = req.body;
    await pool.query('UPDATE "Area" SET area_name = $1, description = $2 WHERE area_id = $3', [area_name, description, req.params.id]);
    res.json({ success: true, message: 'Area updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/areas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM "Area" WHERE area_id = $1', [req.params.id]);
    res.json({ success: true, message: 'Area deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Citizens endpoints
app.get('/citizens', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Citizen" ORDER BY citizen_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/citizens', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    await pool.query('INSERT INTO "Citizen" (name, email, phone) VALUES ($1, $2, $3)', [name, email, phone]);
    res.json({ success: true, message: 'Citizen created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/citizens/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM "Citizen" WHERE citizen_id = $1', [req.params.id]);
    res.json({ success: true, message: 'Citizen deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bills endpoints
app.get('/bills', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Bill" ORDER BY bill_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/bills', async (req, res) => {
  try {
    const { citizen_id, amount, status } = req.body;
    await pool.query('INSERT INTO "Bill" (citizen_id, amount, status) VALUES ($1, $2, $3)', [citizen_id, amount, status || 'Pending']);
    res.json({ success: true, message: 'Bill created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Waste endpoints
app.get('/waste', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Waste" ORDER BY waste_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/waste', async (req, res) => {
  try {
    const { area_id, category, quantity } = req.body;
    await pool.query('INSERT INTO "Waste" (area_id, category, quantity) VALUES ($1, $2, $3)', [area_id, category, quantity]);
    res.json({ success: true, message: 'Waste record created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Payments endpoints
app.get('/payments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Payment" ORDER BY payment_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/payments', async (req, res) => {
  try {
    const { bill_id, amount } = req.body;
    await pool.query('INSERT INTO "Payment" (bill_id, amount) VALUES ($1, $2)', [bill_id, amount]);
    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bins endpoints
app.get('/bins', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Bins" ORDER BY bin_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/bins', async (req, res) => {
  try {
    const { area_id, bin_type, fill_level } = req.body;
    await pool.query('INSERT INTO "Bins" (area_id, bin_type, fill_level) VALUES ($1, $2, $3)', [area_id, bin_type, fill_level || 0]);
    res.json({ success: true, message: 'Bin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crew endpoints
app.get('/crew', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Crew" ORDER BY crew_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/crew', async (req, res) => {
  try {
    const { crew_name, role } = req.body;
    await pool.query('INSERT INTO "Crew" (crew_name, role) VALUES ($1, $2)', [crew_name, role]);
    res.json({ success: true, message: 'Crew member created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedules endpoints
app.get('/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Collection_Schedule" ORDER BY schedule_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/schedules', async (req, res) => {
  try {
    const { area_id, schedule_day, schedule_time } = req.body;
    await pool.query('INSERT INTO "Collection_Schedule" (area_id, schedule_day, schedule_time) VALUES ($1, $2, $3)', [area_id, schedule_day, schedule_time]);
    res.json({ success: true, message: 'Schedule created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running', status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
