// Custom application error class extends native Error
// Used for throwing application-specific errors with status codes
class AppError extends Error {
  constructor(message, statusCode) {
    // call parent Error constructor
    super(message);

    // set HTTP status code for error response
    this.statusCode = statusCode;

    // set name for debugging
    this.name = 'AppError';

    // capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
