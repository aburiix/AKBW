import Joi from "joi";

const sendSmsSchema = Joi.object({
    phone: Joi.string().required(),
    type: Joi.string().valid("register", "login").optional(),
});

const verifySmsSchema = Joi.object({
    phone: Joi.string().required(),
    code: Joi.string().required(),
});

export {
    sendSmsSchema,
    verifySmsSchema,
};