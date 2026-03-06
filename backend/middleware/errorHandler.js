// generic express error handler middleware
// must have four parameters so express recognizes it as error handler
function errorHandler(err, req, res, next) {
  // log full error for debugging
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Une erreur interne est survenue';
  // respond with JSON structure containing success flag and message
  res.status(status).json({ success: false, message });
}

export default errorHandler;
