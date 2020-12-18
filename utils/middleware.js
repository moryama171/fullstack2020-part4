const errorHandler = (error, request, response, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error.message);
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

module.exports = {
  errorHandler,
};