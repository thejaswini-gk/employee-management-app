const EmployeeModel = require('../models/employeeModel');

class EmployeeController {
  // Get all employees with search and filter
  static async getAllEmployees(req, res, next) {
    try {
      const { search, department } = req.query;
      const employees = await EmployeeModel.getAll(search || '', department || '');
      
      res.json({
        success: true,
        count: employees.length,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single employee by ID
  static async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await EmployeeModel.getById(id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new employee
  static async createEmployee(req, res, next) {
    try {
      const employee = await EmployeeModel.create(req.body);
      
      res.status(201).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update employee
  static async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if employee exists
      const existing = await EmployeeModel.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      const result = await EmployeeModel.update(id, req.body);
      
      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete employee
  static async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const result = await EmployeeModel.delete(id);

      if (!result.deleted) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      res.json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all departments
  static async getDepartments(req, res, next) {
    try {
      const departments = await EmployeeModel.getDepartments();
      
      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmployeeController;
