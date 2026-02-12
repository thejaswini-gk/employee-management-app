import React, { useState, useEffect } from 'react';
import EmployeeFilter from './components/EmployeeFilter/EmployeeFilter';
import EmployeeList from './components/EmployeeList/EmployeeList';
import EmployeeForm from './components/EmployeeForm/EmployeeForm';
import employeeService from './services/employeeService';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, [searchTerm, departmentFilter]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll(searchTerm, departmentFilter);
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (search, department) => {
    setSearchTerm(search);
    setDepartmentFilter(department);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await employeeService.delete(id);
      if (response.success) {
        loadEmployees();
        alert('Employee deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingEmployee) {
        response = await employeeService.update(editingEmployee.id, formData);
      } else {
        response = await employeeService.create(formData);
      }

      if (response.success) {
        setShowForm(false);
        setEditingEmployee(null);
        loadEmployees();
        alert(editingEmployee ? 'Employee updated successfully' : 'Employee created successfully');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Employee Management System</h1>
        <button className="add-button" onClick={handleAddNew}>
          + Add Employee
        </button>
      </header>

      <main className="App-main">
        <EmployeeFilter onFilterChange={handleFilterChange} />
        <EmployeeList
          employees={employees}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

export default App;
