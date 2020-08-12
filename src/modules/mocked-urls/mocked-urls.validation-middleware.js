const { body, param, validationResult } = require('express-validator');

// eslint-disable-next-line consistent-return
const fieldsValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

const validateCreationFields = [
  body(['name', 'url']).trim().not().isEmpty().isString(),
  body('port').not().isEmpty().isNumeric().toInt(),
  fieldsValidation,
];

const validateUpdateFields = [
  param('name').trim().not().isEmpty().isString(),
  body('url').trim().not().isEmpty().isString(),
  body('port').not().isEmpty().isNumeric().toInt(),
  fieldsValidation,
];

const validateDeleteParam = [
  param('name').trim().not().isEmpty().isString(),
  fieldsValidation,
];

module.exports = {
  validateCreationFields,
  validateUpdateFields,
  validateDeleteParam,
};
