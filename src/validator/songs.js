const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  performer: Joi.string().required(),
  genre: Joi.string().allow(null, ''),
  duration: Joi.number().integer().allow(null),
  albumId: Joi.string().allow(null, ''),
});

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
