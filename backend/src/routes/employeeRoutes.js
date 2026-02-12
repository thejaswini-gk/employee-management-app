const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const { validateEmployee } = require('../middleware/validator');

// Get all employees (with optional search and filter)
router.get('/', EmployeeController.getAllEmployees);

// Get all departments
router.get('/departments', EmployeeController.getDepartments);

// Get single employee
router.get('/:id', EmployeeController.getEmployeeById);

// Create new employee
router.post('/', validateEmployee, EmployeeController.createEmployee);

// Update employee
router.put('/:id', validateEmployee, EmployeeController.updateEmployee);

// Delete employee
router.delete('/:id', EmployeeController.deleteEmployee);

module.exports = router;
