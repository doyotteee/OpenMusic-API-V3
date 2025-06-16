const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const SongPayloadSchema = Joi.object({
  title: Joi.string().pattern(/^(?!\s*$).+/).required().messages({
    'string.pattern.base': 'Title cannot be empty or only whitespace',
  }),
  year: Joi.number().integer().min(1900).max(2100).required(),
  performer: Joi.string().pattern(/^(?!\s*$).+/).required().messages({
    'string.pattern.base': 'Performer cannot be empty or only whitespace',
  }),
  genre: Joi.string().allow(null, '').optional(),
  duration: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.valid(null)
  ).optional(),
  albumId: Joi.string().allow(null, '').optional(),
}).unknown(false);

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
