const { validateEmployeeData, sanitizeString } = require('../utils/validation');

const validateEmployee = (req, res, next) => {
  // Sanitize inputs
  if (req.body.name) req.body.name = sanitizeString(req.body.name);
  if (req.body.email) req.body.email = sanitizeString(req.body.email);
  if (req.body.department) req.body.department = sanitizeString(req.body.department);
  if (req.body.role) req.body.role = sanitizeString(req.body.role);
  if (req.body.hire_date) req.body.hire_date = sanitizeString(req.body.hire_date);

  const errors = validateEmployeeData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

module.exports = {
  validateEmployee,
};
