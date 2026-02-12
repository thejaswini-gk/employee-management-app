// Validation helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const validateEmployeeData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.department || data.department.trim().length === 0) {
    errors.push('Department is required');
  }

  if (!data.role || data.role.trim().length === 0) {
    errors.push('Role is required');
  }

  if (!data.hire_date || !isValidDate(data.hire_date)) {
    errors.push('Valid hire date (YYYY-MM-DD) is required');
  }

  return errors;
};

module.exports = {
  isValidEmail,
  isValidDate,
  sanitizeString,
  validateEmployeeData,
};
