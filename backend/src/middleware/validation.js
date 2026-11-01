const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Job title is required',
    'any.required': 'Job title is required',
  }),
  description: Joi.string().min(1).required(),
  requirements: Joi.array().items(Joi.string()).default([]),
  responsibilities: Joi.array().items(Joi.string()).default([]),
  location: Joi.string().allow('').default(''),
  salaryMin: Joi.number().integer().min(0).allow(null),
  salaryMax: Joi.number().integer().min(0).allow(null),
  employmentType: Joi.string().allow('').default(''),
  experienceLevel: Joi.string().allow('').default(''),
  department: Joi.string().allow('').default(''),
  companyName: Joi.string().allow('').default(''),
});

const postingSchema = Joi.object({
  platforms: Joi.array().items(Joi.string()).min(1).required(),
});

module.exports = { jobSchema, postingSchema };