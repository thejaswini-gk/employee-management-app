const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
