const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body against schema
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Return a 400 Bad Request with validation details
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: "Erreur de validation des données",
        errors
      });
    }
    next(error);
  }
};

module.exports = { validate };
