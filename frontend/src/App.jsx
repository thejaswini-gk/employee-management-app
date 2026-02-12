import { useState, useEffect } from 'react';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import EmployeeFilter from './components/EmployeeFilter';
import { employeeService } from './services/employeeService';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    loadEmployees();
  }, [selectedDepartment]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await employeeService.getEmployees(selectedDepartment);
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (employeeData) => {
    try {
      setError('');
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, employeeData);
      } else {
        await employeeService.createEmployee(employeeData);
      }
      setShowForm(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setError('');
        await employeeService.deleteEmployee(id);
        loadEmployees();
      } catch (err) {
        setError('Failed to delete employee: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  return (
    <div className="app">
      <header>
        <h1>Employee Management System</h1>
      </header>

      <main>
        {error && <div className="error-banner">{error}</div>}

        {!showForm ? (
          <>
            <div className="toolbar">
              <button className="btn btn-primary" onClick={handleAddNew}>
                Add New Employee
              </button>
              <EmployeeFilter
                selectedDepartment={selectedDepartment}
                onFilterChange={setSelectedDepartment}
              />
            </div>

            {loading ? (
              <p className="loading">Loading employees...</p>
            ) : (
              <EmployeeList
                employees={employees}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        ) : (
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;
