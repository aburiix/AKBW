import Joi from "joi";

const contactValidator = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    about: Joi.optional(),
});

export {
    contactValidator
}