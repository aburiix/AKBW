import Joi from "joi";

const createRoleSchema = Joi.object({
    name: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string(),
    access: Joi.array().items(Joi.string()),
});

const adminLoginSchema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required(),
});

export { createRoleSchema, adminLoginSchema };
