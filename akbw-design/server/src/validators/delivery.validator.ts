import Joi from "joi";

const deliveryCreatePostValidator = Joi.object({
    order_id: Joi.string().required(),
    sender_factory_id: Joi.string().required(),
    pickup_type: Joi.string().valid("courier", "self").required(),
    dropoff_type: Joi.string().valid("courier", "self").required(),
    is_sender_location: Joi.boolean().required(),
    is_receiver_location: Joi.boolean().required(),
    sender: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        city_code: Joi.string().required(),
        branch_code: Joi.string().required(),
    }).required(),
    receiver: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        phone1: Joi.string().required(),
        address: Joi.string().required(),
        latitude: Joi.string().required(),
        longitude: Joi.string().required(),
        city_code: Joi.string().required(),
        branch_code: Joi.string().required(),
    }).required(),
});

const deliveryCalculateBodyValidator = Joi.object({
    receiverCityCode: Joi.string().required(),
    products: Joi.array().items(Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.string().required(),
    })).required(),
});


const deliveryFromToLinksQueryValidator = Joi.object({
    shipmentIds: Joi.array().items(Joi.string()).required(),
});

const senderConfigBodyValidator = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    region_code: Joi.string().required(),
    city_code: Joi.string().required(),
    branch_code: Joi.string().required(),
    lat_long: Joi.string().allow("", null),
}).required();

const distanceBodyValidator = Joi.object({
    origin: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
    }).required(),
    destination: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
    }).required(),
}).required();


export {
    deliveryCreatePostValidator,
    deliveryCalculateBodyValidator,
    deliveryFromToLinksQueryValidator,
    senderConfigBodyValidator,
    distanceBodyValidator
};