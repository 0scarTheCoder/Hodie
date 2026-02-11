/**
 * Global Error Handler Middleware
 * Sanitizes errors before sending to client
 */

const errorHandler = (err, req, res, next) => {
  // Log full error details server-side
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.auth?.userId,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  const statusCode = err.statusCode || res.statusCode || 500;

  // Sanitize error message for production
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: isProduction ? getSafeErrorMessage(err) : err.message,
    // Only include stack in development
    ...(isProduction ? {} : { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Get safe error message for production
 * Prevents leaking sensitive information
 */
function getSafeErrorMessage(err) {
  // Known safe errors
  const safeErrors = {
    'ValidationError': 'Invalid request data',
    'UnauthorizedError': 'Authentication required',
    'ForbiddenError': 'Access denied',
    'NotFoundError': 'Resource not found',
    'ConflictError': 'Resource already exists',
    'RateLimitError': 'Too many requests',
    'PayloadTooLargeError': 'File too large'
  };

  if (safeErrors[err.name]) {
    return safeErrors[err.name];
  }

  // Check for MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return 'Database operation failed';
  }

  // Check for multer errors (file upload)
  if (err.message?.includes('File too large')) {
    return 'Uploaded file exceeds size limit';
  }

  if (err.message?.includes('Invalid file type')) {
    return 'Unsupported file format';
  }

  // Check for JWT errors
  if (err.name === 'JsonWebTokenError') {
    return 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    return 'Authentication token expired';
  }

  // Generic safe message for unknown errors
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
