const API_BASE_URL = '/api';

export const employeeService = {
  // Get all employees
  async getEmployees(department = '') {
    const url = department 
      ? `${API_BASE_URL}/employees?department=${encodeURIComponent(department)}`
      : `${API_BASE_URL}/employees`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  },

  // Get employee by ID
  async getEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch employee');
    }
    return response.json();
  },

  // Create employee
  async createEmployee(employee) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.errors?.join(', ') || 'Failed to create employee');
    }
    return data;
  },

  // Update employee
  async updateEmployee(id, employee) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.errors?.join(', ') || 'Failed to update employee');
    }
    return data;
  },

  // Delete employee
  async deleteEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete employee');
    }
    return response.json();
  },
};
