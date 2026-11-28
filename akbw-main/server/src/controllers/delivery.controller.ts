import type { ICalculateDeliveryCostRequest } from "../types/delivery.types.js";
import type { NextFunction, Request, Response } from "express";
import deliveryService from "../services/delivery.service.js";
import { prisma } from "../db/client.js";
import { isAxiosError } from "axios";
import { safeErr } from "../utils/safeErr.util.js";

export const getRegions = async (req: Request, res: Response) => {
    try {
        const regions = await deliveryService.getRegions();
        res.json(regions);
    } catch (error: any) {
        res.status(500).json({
            status: false,
            message: error.message || "Failed to fetch regions",
            status_code: 500
        });
    }
}

export const getCities = async (req: Request, res: Response) => {
    try {
        const { regionCode } = req.query;

        if (!regionCode) {
            return res.status(400).json({
                status: false,
                message: "regionCode is required",
                status_code: 400
            });
        }

        const cities = await deliveryService.getCities(String(regionCode));
        res.json(cities);
    } catch (error: any) {
        res.status(500).json({
            status: false,
            message: error.message || "Failed to fetch cities",
            status_code: 500
        });
    }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await deliveryService.createOrder(req.body);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.query;

        if (!order_id) {
            return res.status(400).json({
                status: false,
                message: "we need order id to process"
            })
        };

        const response = await deliveryService.getState({
            order_id: String(order_id)
        });

        return res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}

export const getBranches = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { regionCode, cityCode } = req.query;
        const branches = await deliveryService.getBranches({
            region_code: String(regionCode),
            city_code: String(cityCode)
        });

        res.status(200).json(branches);
    } catch (err) {
        if (isAxiosError(err)) {
            console.log("error getBranches", err.response?.data);
        }
        next(err);
    }
}


export const calculateDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { receiverCityCode, products } = req.body;

        if (!receiverCityCode || !products || !Array.isArray(products)) {
            return res.status(400).json({
                status: false,
                message: "receiverCityCode va products ro'yxati majburiy."
            });
        }

        let totalDeliveryCost = 0;

        // Har xil posilkalarni (jo'natuvchi shaharlar kesimida) yig'ish uchun ob'ekt
        // Kalit (key) — BTS shahar kodi bo'ladi.
        // Qiymat (value) — o'sha shahardan ketadigan mahsulotlar to'plami.
        const shipmentsGroup: Record<string, { weight: number; volumeCc: number }> = {};

        // 1. Barcha mahsulotlarni bazadan tekshirib, turlariga qarab guruhlaymiz
        for (const item of products) {
            const dbProduct = await prisma.products.findUnique({
                where: { id: Number(item.productId) },
                include: { factory: true },
            });

            if (!dbProduct) continue;

            const qty = Number(item.quantity || 1);
            let senderCityCode = "";

            // Mahsulot turini tekshiramiz (Prisma Enum: SELF yoki FACTORY)
            if (dbProduct.type === "SELF") {
                // 🚀 SELF bo'lsa, o'zimiz konstanta qilgan kodni beramiz
                senderCityCode = "0102";
            } else if (dbProduct.type === "FACTORY" && dbProduct.factory) {
                // FACTORY bo'lsa, zavodning bazadagi kodini olamiz
                senderCityCode = dbProduct.factory.bts_city_code;
            }

            // Agar biron sabab bilan shahar kodi aniqlanmasa, o'tkazib yuboramiz
            if (!senderCityCode) continue;

            // Mahsulotning hajmi (sm3 da)
            const x = dbProduct.volume_x || 30;
            const y = dbProduct.volume_y || 20;
            const z = dbProduct.volume_z || 5;
            const productVolumeCc = (x * y * z) * qty;
            const productWeight = (dbProduct.weight || 0.3) * qty;

            // Guruhda ushbu shahar kodi mavjud bo'lsa qo'shamiz, bo'lmasa ochamiz
            if (!shipmentsGroup[senderCityCode]) {
                shipmentsGroup[senderCityCode] = { weight: 0, volumeCc: 0 };
            }

            shipmentsGroup[senderCityCode]!.weight += productWeight;
            shipmentsGroup[senderCityCode]!.volumeCc += productVolumeCc;
        }

        console.log("Shakllangan posilkalar guruhlari (Shaharlar kesimida):", shipmentsGroup);

        for (const [senderCity, data] of Object.entries(shipmentsGroup)) {

            const sideLength = Math.max(10, Math.round(Math.cbrt(data.volumeCc)));

            const payload: ICalculateDeliveryCostRequest = {
                senderCityCode: senderCity,
                receiverCityCode,
                weight: data.weight > 0 ? data.weight : 0.5,
                volume: {
                    x: sideLength,
                    y: sideLength,
                    z: sideLength
                },
                pickup_type: "self",
                dropoff_type: "branch",
                is_multiple_cost: 1,
            };

            console.log(`BTS API'ga so'rov yuborilmoqda (${senderCity} -> ${receiverCityCode}):`, payload);

            try {
                const cost = await deliveryService.calculateDeliveryCost(payload);
                console.log(`Shahar ${senderCity} dan yetkazib berish narxi: ${cost} so'm`);

                if (cost && !isNaN(cost)) {
                    totalDeliveryCost += cost;
                }
            } catch (apiError) {
                console.error(`BTS API hisoblashda xato (${senderCity}):`, apiError);
                // Agar favqulodda BTS API ishlamay qolsa, biznes mantiq to'xtamasligi uchun zaxira narx qo'shish (masalan 25000)
                totalDeliveryCost += 25000;
            }
        }

        console.log("Yakuniy umumiy yetkazib berish summasi: ", totalDeliveryCost);

        return res.status(200).json({
            status: true,
            total_price: totalDeliveryCost,
            shipments_count: Object.keys(shipmentsGroup).length
        });

    } catch (error) {
        next(error);
    }
};


export const getDeliveryFromToLinks = async(req: Request, res:Response, next:NextFunction) => {
    try {
        const {shipmentIds} = req.body;

        let finalResponse = [];

        const senderConfig = await prisma.senderConfig.findFirst({ orderBy: { id: "asc" } });

        for(const shipmentId of shipmentIds) {
            const id = typeof shipmentId === 'string' ? parseInt(shipmentId, 10) : Number(shipmentId);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    message: `Invalid shipment ID: ${shipmentId}`,
                    ok: false
                });
            }

            const shipment = await prisma.shipment.findUnique({
                where: {
                    id: id
                }
            });

            let fromBranchData = null;
            let toBranchData = null;

            try {
                const fromBranches = await deliveryService.getBranches({
                    region_code: shipment?.sender_region_code as string,
                    city_code: shipment?.sender_city_code as string,
                });
                fromBranchData = fromBranches?.data?.items?.find((branch: any) => branch.code == shipment?.sender_branch_code) || null;
            } catch (error) {
                console.error("Failed to fetch sender branch info for shipment", id, safeErr(error));
            }

            try {
                const toBranches = await deliveryService.getBranches({
                    region_code: shipment?.receiver_region_code as string,
                    city_code: shipment?.receiver_city_code as string,
                });
                toBranchData = toBranches?.data?.items?.find((branch: any) => branch.code == shipment?.receiver_branch_code) || null;
            } catch (error) {
                console.error("Failed to fetch receiver branch info for shipment", id, safeErr(error));
            }

            const fromLatLong = fromBranchData?.lat_long || senderConfig?.lat_long || "";
            const toLatLong = toBranchData?.lat_long || "";

            finalResponse.push({
                shipmentId,
                fromLink: fromLatLong ? `https://www.google.com/maps/dir/?api=1&destination=${fromLatLong}` : "",
                toLink: toLatLong ? `https://www.google.com/maps/dir/?api=1&destination=${toLatLong}` : "",
                fromBranchName: fromBranchData?.address || senderConfig?.address || "",
                toBranchName: toBranchData?.address || "",
            });
        }

        return res.status(200).json(finalResponse);
    } catch (error) {
        next(error);
    }
}

const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.startsWith("+998") && digits.length === 13) return digits;
    if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
    if (digits.startsWith("8") && digits.length === 12) return `+998${digits.slice(1)}`;
    if (digits.startsWith("9") && digits.length === 12) return `+998${digits.slice(1)}`;
    return digits;
};

const isValidPhone = (phone: string): boolean => /^\+998\d{9}$/.test(phone);

export const getSenderConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.senderConfig.findFirst({ orderBy: { id: "asc" } });
        return res.status(200).json({
            status: true,
            message: "Sender config retrieved successfully",
            data: config || null,
        });
    } catch (error) {
        next(error);
    }
};

export const saveSenderConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, phone, address, region_code, city_code, branch_code, lat_long } = req.body || {};

        if (!name || !phone || !address || !region_code || !city_code || !branch_code) {
            return res.status(400).json({
                ok: false,
                message: "name, phone, address, region_code, city_code va branch_code majburiy.",
            });
        }

        const normalizedPhone = normalizePhone(String(phone));
        if (!isValidPhone(normalizedPhone)) {
            return res.status(400).json({
                ok: false,
                message: "Telefon raqam formati noto'g'ri. Talab qilinadigan format: +998901234567",
            });
        }

        const config = await prisma.senderConfig.upsert({
            where: { id: 1 },
            update: {
                name: String(name),
                phone: normalizedPhone,
                address: String(address),
                region_code: String(region_code),
                city_code: String(city_code),
                branch_code: String(branch_code),
                lat_long: lat_long ? String(lat_long) : null,
            },
            create: {
                id: 1,
                name: String(name),
                phone: normalizedPhone,
                address: String(address),
                region_code: String(region_code),
                city_code: String(city_code),
                branch_code: String(branch_code),
                lat_long: lat_long ? String(lat_long) : null,
            },
        });

        return res.status(200).json({
            status: true,
            message: "Sender config saved successfully",
            data: config,
        });
    } catch (error) {
        next(error);
    }
};

export const getDistanceFromLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { origin, destination } = req.body || {};

        if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
            return res.status(400).json({
                ok: false,
                message: "origin va destination (lat, lng) majburiy.",
            });
        }

        const result = await deliveryService.getDistance(
            { lat: Number(origin.lat), lng: Number(origin.lng) },
            { lat: Number(destination.lat), lng: Number(destination.lng) },
        );

        return res.status(200).json({
            status: true,
            message: "Distance retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}