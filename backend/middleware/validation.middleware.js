// validation middleware generator. accepts a Joi or Zod schema
function validate(schema) {
  return (req, res, next) => {
    const data = req.body;

    // Joi schemas use validate(), Zod use safeParse
    let result;
    if (typeof schema.validate === 'function') {
      // Joi
      result = schema.validate(data, { abortEarly: false });
      if (result.error) {
        return res.status(400).json({ success: false, errors: result.error.details });
      }
    } else if (typeof schema.safeParse === 'function') {
      // Zod
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.errors });
      }
    } else {
      // unknown schema type
      console.warn('validate middleware received unknown schema type');
    }

    // if validation passed, continue
    next();
  };
}

module.exports = { validate };
