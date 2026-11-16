import { escapeHtml } from "../utils/html.util.js";
import { ShipmentState, OrderState } from "../generated/prisma/client/index.js";
import type { NextFunction, Request, Response } from "express";
import deliveryService from "../services/delivery.service.js";
import { prisma } from "../db/client.js";
import type { ICreateOrderRequest } from "../types/delivery.types.js";
import { createShipmentsAfterPayment } from "./order.controller.js";
import axios from "axios";

const VALID_TRANSITIONS: Record<ShipmentState, ShipmentState[]> = {
    [ShipmentState.PENDING]: [ShipmentState.READY_FOR_BTS],
    [ShipmentState.READY_FOR_BTS]: [ShipmentState.SENT],
    [ShipmentState.SENT]: [ShipmentState.DELIVERED],
    [ShipmentState.DELIVERED]: [],
    [ShipmentState.CANCELLED]: [],
    [ShipmentState.ORDERED_FROM_SUPPLIER]: [ShipmentState.SUPPLIER_CONFIRMED],
    [ShipmentState.SUPPLIER_CONFIRMED]: [ShipmentState.IN_TRANSIT],
    [ShipmentState.IN_TRANSIT]: [ShipmentState.ARRIVED_UZBEKISTAN],
    [ShipmentState.ARRIVED_UZBEKISTAN]: [ShipmentState.IN_CUSTOMS],
    [ShipmentState.IN_CUSTOMS]: [ShipmentState.READY_FOR_BTS],
};

function logShipmentStatusChange(
    shipmentId: number,
    previousState: ShipmentState,
    newState: ShipmentState,
    updatedBy: string
) {
    console.log(`[Shipment Status Change] ID: ${shipmentId}, Previous: ${previousState}, New: ${newState}, UpdatedBy: ${updatedBy}, Timestamp: ${new Date().toISOString()}`);
}

async function notifyBTSOrderCreated(shipmentId: number, trackingNumber: string) {
    try {
        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            include: {
                factory: true,
                order: {
                    include: {
                        user: true,
                    }
                },
                orderItems: {
                    include: {
                        product: {
                            include: {
                                translations: true,
                            }
                        }
                    }
                },
            }
        });

        if (!shipment) return;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error("TELEGRAM_BOT_TOKEN is not set");
            return;
        }

        let message = `📦 BTS buyurtma yaratildi!\n\n`;
        message += `Yuk raqami: #${shipment.id}\n`;
        message += `BTS buyurtma ID: ${trackingNumber}\n`;
        message += `Buyurtma raqami: #${shipment.order.id}\n`;
        message += `Mijoz: ${escapeHtml(shipment.order.user.name)} ${escapeHtml(shipment.order.user.lastName)}\n`;
        message += `Telefon: ${shipment.order.user.phone}\n\n`;
        message += `Buyurtma to'lov holati: ${shipment.order.state}`
        message += `Mahsulotlar:\n`;

        shipment.orderItems.forEach((item, idx) => {
            const productName = item?.product?.translations?.[0]?.name || `Mahsulot ${item.productId}`;
            message += `${idx + 1}. ${escapeHtml(productName)} - ${item.quantity} ta\n`;
        });

        // Notify factory workers if factory shipment
        if (shipment.factoryId) {
            const workers = await prisma.workers.findMany({
                where: { factory_id: shipment.factoryId },
                select: { tg_id: true },
            });

            for (const worker of workers) {
                if (!worker.tg_id) continue;

                try {
                    await axios.post(
                        `https://api.telegram.org/bot${botToken}/sendMessage`,
                        {
                            chat_id: worker.tg_id,
                            text: message,
                            parse_mode: "HTML",
                        }
                    );
                    console.log(`BTS order notification sent to worker ${worker.tg_id} for shipment ${shipment.id}`);
                } catch (error: any) {
                    console.error(`Failed to send BTS order notification to worker ${worker.tg_id}:`, error?.response?.data?.description || error.message);
                }
            }
        }

        // TODO: Notify admin for self shipments when admin notification system is implemented
        console.log(`BTS order ${trackingNumber} created for shipment ${shipment.id}`);
    } catch (error) {
        console.error("Error notifying BTS order creation:", error);
    }
}

export const getShipmentStates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shipmentStates = Object.values(ShipmentState);
        res.status(200).json(shipmentStates);
    } catch (error) {
        next(error);
    }
}

export const getOrderShipments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { state } = req.query;
        let where: any = {
            orderId: Number(id),
        };

        if (state) {
            where.state = state as ShipmentState;
        }

        const shipments = await prisma.shipment.findMany({
            where: where,
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                translations: true,
                            }
                        }
                    }
                },
                order: {
                    include: {
                        user: true,
                    }
                }
            }
        });

        if (shipments.length === 0) {
            const order = await prisma.orders.findUnique({
                where: { id: Number(id) },
            });

            if (order && order.state === OrderState.PAID) {
                console.log(`Self-healing: Creating shipments for PAID order ${order.id} that has no shipments`);
                await createShipmentsAfterPayment(order.id);

                const updatedShipments = await prisma.shipment.findMany({
                    where: where,
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    include: {
                                        translations: true,
                                    }
                                }
                            }
                        },
                        order: {
                            include: {
                                user: true,
                            }
                        }
                    }
                });

                return res.status(200).json(updatedShipments);
            }
        }

        return res.status(200).json(shipments);
    } catch (error) {
        next(error);
    }
}

export const getFactoryShipments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const factoryId = req.user;
        const { state } = req.query;
        let where: any = {
            factoryId: Number(factoryId),
        };

        if (state) {
            where.state = state as ShipmentState;
        }

        const shipments = await prisma.shipment.findMany({
            where: where,
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                translations: true,
                            }
                        }
                    }
                },
                order: {
                    include: {
                        user: true,
                    }
                }
            }
        });

        return res.status(200).json(shipments);
    } catch (error) {
        next(error);
    }
};

export const getAdminShipments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { state } = req.query;
        let where: any = {
            factoryId: null,
        };

        if (state) {
            where.state = state as ShipmentState;
        }

        const shipments = await prisma.shipment.findMany({
            where: where,
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                translations: true,
                            }
                        }
                    }
                },
                order: {
                    include: {
                        user: true,
                        address: true,
                    }
                },
                factory: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return res.status(200).json(shipments);
    } catch (error) {
        next(error);
    }
}

export const updateShipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { state, senderAddress } = req.body;
        let senderBranchCode = req.body.senderBranchCode as string | undefined;
        let senderCityCode = req.body.senderCityCode as string | undefined;
        let senderRegionCode = req.body.senderRegionCode as string | undefined;
        const updatedBy = req.user?.toString() || 'system';

        if (!Object.values(ShipmentState).includes(state)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid shipment state",
            });
        };


        const shipment = await prisma.shipment.findUnique({
            where: { id: Number(id) },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                translations: true,
                            },
                        },
                    },
                },
                order: {
                    include: {
                        user: true,
                        address: true,
                    },
                },
                factory: true,
            },
        });

        if (!shipment) {
            return res.status(404).json({
                ok: false,
                error: "Shipment not found",
            });
        }

        // Fabrika faqat o'ziga tegishli jo'natmani o'zgartira oladi
        const callerFactoryId = (req as any).factoryId;
        if (callerFactoryId && shipment.factoryId !== callerFactoryId) {
            return res.status(403).json({ ok: false, error: "Forbidden" });
        }

        const validNextStates = VALID_TRANSITIONS[shipment.state as ShipmentState] || [];
        if (!validNextStates.includes(state as ShipmentState)) {
            return res.status(400).json({
                ok: false,
                error: `Invalid status transition from ${shipment.state} to ${state}. Valid transitions: ${validNextStates.join(', ')}`,
            });
        }

        logShipmentStatusChange(shipment.id, shipment.state as ShipmentState, state as ShipmentState, updatedBy);

        let trackingNumber = shipment.tracking_number;
        if (state === ShipmentState.READY_FOR_BTS && !shipment.tracking_number) {
            try {
                console.log("hey we are here buddy: Test");
                console.log("factory shipment.controller=: ", shipment.factory);
                if (shipment.factory) {
                    const calculateDeliveryPrice = await deliveryService.calculateDeliveryCost({
                        pickup_type: "self",
                        dropoff_type: "branch",
                        senderCityCode: shipment.factory.bts_city_code,
                        receiverCityCode: shipment.order.address.city_code,
                        is_multiple_cost: 1,
                        weight: shipment.orderItems.reduce((acc, item) => acc + item.quantity, 0),
                        volume: {
                            x: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_x, 0),
                            y: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_y, 0),
                            z: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_z, 0),
                        }
                    });

                    console.log("shipment-factory: ", shipment.factory);

                    const payload: ICreateOrderRequest = {
                        clientId: shipment.id.toString(),
                        pickup_type: "self",
                        dropoff_type: "branch",
                        is_sender_location: false,
                        is_receiver_location: false,
                        sender: {
                            name: shipment.factory.name,
                            phone: shipment.factory.phone,
                            address: shipment.factory.address,
                            city_code: shipment.factory.bts_city_code,
                        },
                        receiver: {
                            name: shipment.order.user.name,
                            phone: shipment.order.user.phone,
                            address: shipment.order.address.address,
                            city_code: shipment.order.address.city_code,
                            branch_code: shipment.order.address.branch_code,
                        },
                        takePhoto: 1,
                        back_money: calculateDeliveryPrice,
                        cargo: {
                            weight: shipment.orderItems.reduce((acc, item) => acc + item.quantity, 0),
                            volume: shipment.orderItems.reduce(
                                (acc, item) =>
                                    acc +
                                    ((item.product?.volume_x || 0) *
                                        (item.product?.volume_y || 0) *
                                        (item.product?.volume_z || 0)) *
                                    item.quantity,
                                0
                            ),
                            piece: shipment.orderItems.length,
                            packageId: 4,
                            postTypeId: 1,
                            postTypes: shipment.orderItems.map((item) => ({
                                code: item.product.id.toString(),
                                name: item.product.translations[0]?.name || "",
                                count: item.quantity,
                                cost: item.product.price,
                            })),
                            options: [{
                                optionId: 2,
                                goods: shipment.orderItems.map((item) => ({
                                    mxikGoodsId: item.product.id,
                                    amount: item.quantity,
                                    goodPrice: item.product.price,
                                }))
                            }],
                        },
                        ready_to_take: false,
                    }
                    console.log("the paylaod from shipment-controller=: ", payload);

                    const response = await deliveryService.createOrder(payload)

                    console.log("the response from shipment-controller=: ", response);
                    if (response?.data?.orderId) {
                        trackingNumber = response.data.orderId;
                        console.log(`[Postal Provider] Order created for shipment ${shipment.id}, tracking number: ${trackingNumber}`);
                        // Notify factory/admin with BTS order ID
                        if (trackingNumber) {
                            await notifyBTSOrderCreated(shipment.id, trackingNumber);
                        }
                    }
                } else {
                    const senderConfig = await prisma.senderConfig.findFirst({ orderBy: { id: "asc" } });

                    const configCityCode = senderConfig?.city_code || shipment.sender_city_code || "";
                    const configBranchCode = senderConfig?.branch_code || shipment.sender_branch_code || "";
                    const configRegionCode = senderConfig?.region_code || shipment.sender_region_code || "01";

                    senderBranchCode = configBranchCode;
                    senderCityCode = configCityCode;
                    senderRegionCode = configRegionCode;

                    const calculateDeliveryPrice = await deliveryService.calculateDeliveryCost({
                        pickup_type: "self",
                        dropoff_type: "branch",
                        senderCityCode: configCityCode,
                        receiverCityCode: shipment.order.address.city_code,
                        is_multiple_cost: 1,
                        weight: shipment.orderItems.reduce((acc, item) => acc + item.quantity, 0),
                        volume: {
                            x: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_x, 0),
                            y: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_y, 0),
                            z: shipment.orderItems.reduce((acc, item) => acc + item.product.volume_z, 0),
                        }
                    });

                    console.log("shipment-factory: ", shipment.factory);
                    console.log("sender-config: ", senderConfig);

                    const senderInfo = {
                        name: senderConfig?.name || "AKBW Ombori",
                        phone: senderConfig?.phone || process.env.BTS_SENDER_PHONE || "+998901234567",
                        address: senderConfig?.address || "Toshkent shahar, Yunusobod tumani, AKB Ombori",
                        city_code: configCityCode,
                    };

                    const payload: ICreateOrderRequest = {
                        clientId: shipment.id.toString(),
                        pickup_type: "self",
                        dropoff_type: "branch",
                        is_sender_location: false,
                        is_receiver_location: false,
                        sender: senderInfo,
                        receiver: {
                            name: shipment.order.user.name,
                            phone: shipment.order.user.phone,
                            address: shipment.order.address.address,
                            city_code: shipment.order.address.city_code,
                            branch_code: shipment.order.address.branch_code,
                        },
                        takePhoto: 1,
                        back_money: calculateDeliveryPrice,
                        cargo: {
                            weight: shipment.orderItems.reduce((acc, item) => acc + item.quantity, 0),
                            volume: shipment.orderItems.reduce(
                                (acc, item) =>
                                    acc +
                                    ((item.product?.volume_x || 0) *
                                        (item.product?.volume_y || 0) *
                                        (item.product?.volume_z || 0)) *
                                    item.quantity,
                                0
                            ),
                            piece: shipment.orderItems.length,
                            packageId: 4,
                            postTypeId: 1,
                            postTypes: shipment.orderItems.map((item) => ({
                                code: item.product.id.toString(),
                                name: item.product.translations[0]?.name || "",
                                count: item.quantity,
                                cost: item.product.price,
                            })),
                            options: [{
                                optionId: 2,
                                goods: shipment.orderItems.map((item) => ({
                                    mxikGoodsId: item.product.id,
                                    amount: item.quantity,
                                    goodPrice: item.product.price,
                                }))
                            }],
                        },
                        ready_to_take: false,
                    }
                    console.log("the paylaod from shipment-controller=: ", payload);

                    const response = await deliveryService.createOrder(payload)

                    console.log("the response from shipment-controller=: ", response);
                    if (response?.data?.orderId) {
                        trackingNumber = response.data.orderId;
                        console.log(`[Postal Provider] Order created for shipment ${shipment.id}, tracking number: ${trackingNumber}`);
                        // Notify factory/admin with BTS order ID
                        if (trackingNumber) {
                            await notifyBTSOrderCreated(shipment.id, trackingNumber);
                        }
                    }
                }
            } catch (postalError) {
                console.error("Failed to create postal provider order:", postalError);
            }
        }

        const updatedShipment = await prisma.shipment.update({
            where: { id: Number(id) },
            data: {
                state: state as ShipmentState,
                ...(trackingNumber && { tracking_number: trackingNumber }),
                ...(senderBranchCode && { sender_branch_code: senderBranchCode }),
                ...(senderCityCode && { sender_city_code: senderCityCode }),
                ...(senderRegionCode && { sender_region_code: senderRegionCode }),
            },
        });

        return res.status(200).json({
            ok: true,
            message: "Shipment status updated successfully",
            data: updatedShipment,
        });
    } catch (error) {
        next(error);
    }
};