import Joi from "joi";

export const reviewOrderValidator = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        // manfiy yoki kasr son umumiy summani buzardi
        quantity: Joi.number().integer().min(1).max(100).required(),
        colorId: Joi.number().integer().required(),
        sizeId: Joi.number().integer().required(),
      }),
    )
    .min(1)
    .max(50)
    .required(),
  total_price: Joi.number().required(),
  coupon_code: Joi.string().allow(null, '').optional(),
  coupon_id: Joi.number().allow(null).optional(),
  selectedBranch: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    regionCode: Joi.string().required(),
    cityCode: Joi.string().required(),
    address: Joi.string().required(),
    lat_long: Joi.string().required(),
    phone: Joi.string().required(),
    video_link: Joi.string().optional().allow(""),
    working_hours: {
      0: Joi.string().allow(null).optional(),
      1: Joi.string().allow(null).optional(),
      2: Joi.string().allow(null).optional(),
      3: Joi.string().allow(null).optional(),
      4: Joi.string().allow(null).optional(),
      5: Joi.string().allow(null).optional(),
      6: Joi.string().allow(null).optional(),
      7: Joi.string().allow(null).optional(),
    },
  }).required(),
});