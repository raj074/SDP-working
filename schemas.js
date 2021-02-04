const Joi = require('joi');

const JoipostSchema = Joi.object({
  post: Joi.object({
    body: Joi.string().required(),
    image: Joi.string().allow(''),
  }).required()
});

module.exports = JoipostSchema;
