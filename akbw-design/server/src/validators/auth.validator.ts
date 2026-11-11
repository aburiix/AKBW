import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().required(),
  referralCode: Joi.string().allow("").optional(),
});

export const loginSchema = Joi.object({
  phone: Joi.string().required(),
});
