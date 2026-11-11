import joi from "joi";

export const createCouponSchema = joi.object({
  code: joi.string().required(),
  discount: joi.number().required(),
  expiry: joi.date().required(),
});

export const updateCouponSchema = joi.object({
  code: joi.string().optional(),
  discount: joi.number().optional(),
  expiry: joi.date().optional(),
});
