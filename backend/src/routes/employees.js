const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Validation helper
const validateEmployee = (employee) => {
  const { name, email, department, role, hire_date } = employee;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }
  if (!department || department.trim().length === 0) {
    errors.push('Department is required');
  }
  if (!role || role.trim().length === 0) {
    errors.push('Role is required');
  }
  if (!hire_date || !hire_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    errors.push('Valid hire date is required (YYYY-MM-DD)');
  }

  return errors;
};

// GET all employees or filter by department
router.get('/', (req, res) => {
  const { department } = req.query;
  
  let query = 'SELECT * FROM employees';
  let params = [];

  if (department) {
    query += ' WHERE department = ?';
    params.push(department);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
    res.json(rows);
  });
});

// GET employee by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching employee:', err.message);
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(row);
  });
});

// POST create new employee
router.post('/', (req, res) => {
  const { name, email, department, role, hire_date } = req.body;

  const errors = validateEmployee(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const query = `
    INSERT INTO employees (name, email, department, role, hire_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [name, email, department, role, hire_date], function(err) {
    if (err) {
      console.error('Error creating employee:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to create employee' });
    }

    res.status(201).json({
      id: this.lastID,
      name,
      email,
      department,
      role,
      hire_date
    });
  });
});

// PUT update employee
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, department, role, hire_date } = req.body;

  const errors = validateEmployee(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const query = `
    UPDATE employees
    SET name = ?, email = ?, department = ?, role = ?, hire_date = ?
    WHERE id = ?
  `;

  db.run(query, [name, email, department, role, hire_date, id], function(err) {
    if (err) {
      console.error('Error updating employee:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Failed to update employee' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      id: parseInt(id),
      name,
      email,
      department,
      role,
      hire_date
    });
  });
});

// DELETE employee
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting employee:', err.message);
      return res.status(500).json({ error: 'Failed to delete employee' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  });
});

module.exports = router;
