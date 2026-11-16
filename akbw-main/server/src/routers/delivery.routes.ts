import { publicApiLimiter } from "../middleware/security.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
import {
    getRegions,
    getCities,
    createOrder,
    getState,
    getBranches,
    calculateDelivery,
    getDeliveryFromToLinks,
    getSenderConfig,
    saveSenderConfig,
    getDistanceFromLocation
} from "../controllers/delivery.controller.js";
import { auth, userAuth } from "../middleware/auth.middleware.js";
import {
    validate
} from "../middleware/validate.middleware.js";
import {
    deliveryCalculateBodyValidator,
    deliveryCreatePostValidator,
    deliveryFromToLinksQueryValidator,
    senderConfigBodyValidator,
    distanceBodyValidator
} from "../validators/delivery.validator.js";
import {
    Router
} from "express";


const router = Router();

router.get("/regions", getRegions);
router.get("/cities", getCities);
router.post("/create-order", checkAdmins, validate(deliveryCreatePostValidator), createOrder);
router.get("/branches", getBranches);
router.get("/state", userAuth, getState);
router.post("/calculate", publicApiLimiter, validate(deliveryCalculateBodyValidator), calculateDelivery)
router.post("/from-to-links", publicApiLimiter, validate(deliveryFromToLinksQueryValidator), getDeliveryFromToLinks);
router.get("/sender-config", checkAdmins, getSenderConfig);
router.put("/sender-config", checkAdmins, validate(senderConfigBodyValidator), saveSenderConfig);
router.post("/distance", publicApiLimiter, validate(distanceBodyValidator), getDistanceFromLocation);

export default router;