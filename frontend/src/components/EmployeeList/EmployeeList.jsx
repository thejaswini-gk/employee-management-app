import React from 'react';
import EmployeeCard from '../EmployeeCard/EmployeeCard';
import styles from './EmployeeList.module.css';

const EmployeeList = ({ employees, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No employees found.</p>
        <p className={styles.emptySubtext}>Try adjusting your search filters or add a new employee.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.count}>
        {employees.length} employee{employees.length !== 1 ? 's' : ''} found
      </div>
      <div className={styles.grid}>
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
