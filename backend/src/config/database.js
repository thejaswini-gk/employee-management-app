const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/employees.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Initialize database schema
const initDatabase = () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      hire_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      return;
    }
    console.log('Employees table ready');
  });

  // Create indexes for search optimization
  db.run('CREATE INDEX IF NOT EXISTS idx_email ON employees(email)', (err) => {
    if (err) console.error('Error creating email index:', err.message);
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_department ON employees(department)', (err) => {
    if (err) console.error('Error creating department index:', err.message);
  });
};

initDatabase();

module.exports = db;
