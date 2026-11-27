import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().valid("male", "female").required(),
  // tug'ilgan sana (YYYY-MM-DD), viloyat va tuman — majburiy; email — ixtiyoriy
  birthDate: Joi.date().iso().min("1920-01-01").max("now").required(),
  region: Joi.string().trim().min(2).max(80).required(),
  district: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().max(120).allow("").optional(),
  referralCode: Joi.string().allow("").optional(),
  verifyToken: Joi.string().required(),
});

export const loginSchema = Joi.object({
  phone: Joi.string().required(),
  verifyToken: Joi.string().required(),
});
