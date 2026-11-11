import Joi from "joi";

const factoryCreateValidator = Joi.object({
    name: Joi.string().required(),
    payment_type: Joi.string().valid('MONTH', 'THREEMONTH', 'SIXMONTH', 'YEAR').default('MONTH'),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    bts_region_code: Joi.string().required(),
    bts_city_code: Joi.string().required(),
    bts_branch_code: Joi.string().required(),
    login: Joi.string().required(),
    password: Joi.string().required(),
    bank_name: Joi.string(),
    bank_account: Joi.string(),
    bank_mfo: Joi.string(),
    bank_inn: Joi.string(),
});

const factoryUpdateValidator = Joi.object({
    name: Joi.string().optional(),
    payment_type: Joi.string().valid('MONTH', 'THREEMONTH', 'SIXMONTH', 'YEAR').optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    bts_region_code: Joi.string().optional(),
    bts_city_code: Joi.string().optional(),
    bts_branch_code: Joi.string().optional(),
    login: Joi.string().optional(),
    password: Joi.string().allow('').optional(),
    bank_name: Joi.string().optional(),
    bank_account: Joi.string().optional(),
    bank_mfo: Joi.string().optional(),
    bank_inn: Joi.string(),
});


export {
    factoryCreateValidator,
    factoryUpdateValidator
};