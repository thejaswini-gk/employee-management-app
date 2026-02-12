const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // SQLite unique constraint error
  if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
    return res.status(409).json({
      success: false,
      error: 'Email already exists',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
