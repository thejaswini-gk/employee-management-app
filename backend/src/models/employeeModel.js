const db = require('../config/database');

class EmployeeModel {
  // Get all employees with optional search and filter
  static getAll(searchName = '', filterDepartment = '') {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM employees WHERE 1=1';
      const params = [];

      // Add name search filter (case-insensitive)
      if (searchName && searchName.trim()) {
        query += ' AND LOWER(name) LIKE LOWER(?)';
        params.push(`%${searchName.trim()}%`);
      }

      // Add department filter (exact match, case-insensitive)
      if (filterDepartment && filterDepartment.trim()) {
        query += ' AND LOWER(department) = LOWER(?)';
        params.push(filterDepartment.trim());
      }

      query += ' ORDER BY created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get employee by ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create new employee
  static create(employee) {
    return new Promise((resolve, reject) => {
      const { name, email, department, role, hire_date } = employee;
      const query = `
        INSERT INTO employees (name, email, department, role, hire_date)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(query, [name, email, department, role, hire_date], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...employee });
        }
      });
    });
  }

  // Update employee
  static update(id, employee) {
    return new Promise((resolve, reject) => {
      const { name, email, department, role, hire_date } = employee;
      const query = `
        UPDATE employees
        SET name = ?, email = ?, department = ?, role = ?, hire_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(query, [name, email, department, role, hire_date, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...employee, changes: this.changes });
        }
      });
    });
  }

  // Delete employee
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0, changes: this.changes });
        }
      });
    });
  }

  // Get unique departments
  static getDepartments() {
    return new Promise((resolve, reject) => {
      db.all('SELECT DISTINCT department FROM employees ORDER BY department', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.department));
        }
      });
    });
  }
}

module.exports = EmployeeModel;
