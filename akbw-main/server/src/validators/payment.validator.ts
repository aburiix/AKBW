import Joi from "joi";

export const paynetLinkValidator = Joi.object({
  orderId: Joi.number().required().messages({
    "number.base": "orderId must be a number",
    "any.required": "orderId is required",
  }),
  amount: Joi.number().required().positive().messages({
    "number.base": "amount must be a number",
    "any.required": "amount is required",
    "number.positive": "amount must be positive",
  }),
});

export const paymeLinkValidator = Joi.object({
  orderId: Joi.number().required().messages({
    "number.base": "orderId must be a number",
    "any.required": "orderId is required",
  }),
  amount: Joi.number().required().positive().messages({
    "number.base": "amount must be a number",
    "any.required": "amount is required",
    "number.positive": "amount must be positive",
  }),
});

export const clickCheckoutValidator = Joi.object({
  order_id: Joi.number().required().messages({
    "number.base": "order_id must be a number",
    "any.required": "order_id is required",
  }),
  amount: Joi.number().required().positive().messages({
    "number.base": "amount must be a number",
    "any.required": "amount is required",
    "number.positive": "amount must be positive",
  }),
});
