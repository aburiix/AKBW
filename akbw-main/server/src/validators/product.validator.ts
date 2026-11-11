import Joi from "joi";

const createProductSchema = Joi.object({
    price: Joi.number().required(),
    product_images: Joi.array().items(Joi.string()).required(),
    categories: Joi.array().items(Joi.number()).required(),
    sizes: Joi.array().items(Joi.number()).required(),
    discount: Joi.number().optional(),
    colors: Joi.array().items(Joi.number()).required(),
    type: Joi.string().valid("SELF", "FACTORY").optional(),
    factory_id: Joi.number().optional().allow(null),
    actual_product_link: Joi.string().optional().allow(null),
    translations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        lang: Joi.string().required(),
    })).required(),
    weight: Joi.number().required(),
    volume_x: Joi.number().required(),
    volume_y: Joi.number().required(),
    volume_z: Joi.number().required(),
});

const updateProductSchema = Joi.object({
    price: Joi.number(),
    product_images: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.number()),
    sizes: Joi.array().items(Joi.number()),
    colors: Joi.array().items(Joi.number()),
    discount: Joi.number().optional(),
    type: Joi.string().valid("SELF", "FACTORY"),
    factory_id: Joi.number().allow(null),
    actual_product_link: Joi.string().optional().allow(null),
    translations: Joi.array().items(Joi.object({
        name: Joi.string(),
        description: Joi.string(),
        lang: Joi.string(),
    })),
    weight: Joi.number().optional(),
    volume_x: Joi.number().optional(),
    volume_y: Joi.number().optional(),
    volume_z: Joi.number().optional(),
});

const categoriesSchema = Joi.object({
    translations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        lang: Joi.string().required(),
    })).required(),
    parentId: Joi.number().optional().allow(null),
});

const categoriesUpdateSchema = Joi.object({
    translations: Joi.array().items(Joi.object({
        name: Joi.string(),
        lang: Joi.string(),
    })).required(),
    parentId: Joi.number().optional().allow(null),
});

const sizesSchema = Joi.object({
    translations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        lang: Joi.string().required(),
    })).required(),
});

const sizesUpdateSchema = Joi.object({
    id: Joi.number(),
    translations: Joi.array().items(Joi.object({
        name: Joi.string(),
        lang: Joi.string(),
    })).required(),
});

const colorsSchema = Joi.object({
    translations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        lang: Joi.string().required(),
    })).required(),
});

const colorsUpdateSchema = Joi.object({
    id: Joi.number(),
    translations: Joi.array().items(Joi.object({
        name: Joi.string(),
        lang: Joi.string(),
    })).required(),
});

export {
    createProductSchema,
    updateProductSchema,
    categoriesSchema,
    categoriesUpdateSchema,
    sizesSchema,
    sizesUpdateSchema,
    colorsSchema,
    colorsUpdateSchema
};
