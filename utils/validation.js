// utils/validation.js
const Joi = require('joi');

exports.registrationValidation = Joi.object({
  userType: Joi.string().valid('camper', 'chaplain').required(),
  title: Joi.string().valid('Mr', 'Mrs', 'Miss', 'Dr', 'Rev', 'Prof', 'Canon', 'Ven').required(),
  firstName: Joi.string().required(),
  surname: Joi.string().required(),
  dob: Joi.string().required(),
  otherName: Joi.string().allow(''),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().min(6).required(),
  archdeaconry: Joi.string().required(),
  parish: Joi.string().required(),
  paymentRef: Joi.string().required()
});

exports.loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.adminRegistrationValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});