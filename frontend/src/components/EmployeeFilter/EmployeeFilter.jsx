import React, { useState, useEffect } from 'react';
import employeeService from '../../services/employeeService';
import styles from './EmployeeFilter.module.css';

const EmployeeFilter = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await employeeService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange(value, selectedDepartment);
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setSelectedDepartment(value);
    onFilterChange(searchTerm, value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    onFilterChange('', '');
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGroup}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search employees by name"
        />
        
        <select
          className={styles.departmentSelect}
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          aria-label="Filter by department"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {(searchTerm || selectedDepartment) && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear filters"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeFilter;
