import React from 'react';
import styles from './EmployeeCard.module.css';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.name}>{employee.name}</h3>
        <span className={styles.department}>{employee.department}</span>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.info}>
          <label>Email:</label>
          <span>{employee.email}</span>
        </div>
        <div className={styles.info}>
          <label>Role:</label>
          <span>{employee.role}</span>
        </div>
        <div className={styles.info}>
          <label>Hire Date:</label>
          <span>{new Date(employee.hire_date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <button
          className={styles.editButton}
          onClick={() => onEdit(employee)}
          aria-label={`Edit ${employee.name}`}
        >
          Edit
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(employee.id)}
          aria-label={`Delete ${employee.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
