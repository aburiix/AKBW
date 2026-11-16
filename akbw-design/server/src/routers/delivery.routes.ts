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
import {
    auth
} from "../middleware/auth.middleware.js";
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
router.get("/state", auth, getState);
router.post("/calculate", validate(deliveryCalculateBodyValidator), calculateDelivery)
router.post("/from-to-links", validate(deliveryFromToLinksQueryValidator), getDeliveryFromToLinks);
router.get("/sender-config", checkAdmins, getSenderConfig);
router.put("/sender-config", checkAdmins, validate(senderConfigBodyValidator), saveSenderConfig);
router.post("/distance", validate(distanceBodyValidator), getDistanceFromLocation);

export default router;