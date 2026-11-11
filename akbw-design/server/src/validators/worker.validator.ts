import Joi from "joi";

const workerCreateValidator = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    role: Joi.string().allow("").required(),
    tg_id: Joi.string().required(),
});

const workerUpdateValidator = Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    role: Joi.string().allow("").optional(),
    tg_id: Joi.string().allow("").optional(),
});

export {
    workerCreateValidator,
    workerUpdateValidator
};
