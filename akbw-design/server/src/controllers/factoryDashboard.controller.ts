import { prisma } from "../db/client.js";
import { type Request, type Response, type NextFunction } from "express";
import { OrderItemState, OrderState, ShipmentState } from "../generated/prisma/client/index.js";

export const getFactoryStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const factoryId = Number(req.user);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrdersCount = await prisma.orders.count({
            where: {
                shipments: {
                    some: {
                        factoryId: factoryId,
                        createdAt: { gte: today }
                    }
                }
            }
        });

        const totalSold = await prisma.orders.count({
            where: {
                shipments: {
                    some: {
                        state: ShipmentState.DELIVERED,
                        factoryId: factoryId
                    }
                },
                state: OrderState.PAID,
            }
        });

        const totalPending = await prisma.orders.count({
            where: {
                shipments: {
                    some: {
                        state: ShipmentState.PENDING,
                        factoryId: factoryId,
                    }
                },
                state: OrderState.PAID,
            }
        });

        const balance = await prisma.orderItem.aggregate({
            _sum: {
                price: true,
            },
            where: {
                product: {
                    factory_id: factoryId,
                },
                shipment: {
                    state: ShipmentState.DELIVERED,
                }
            }
        });

        const workersCount = await prisma.workers.count({
            where: {
                factory_id: factoryId
            }
        });

        return res.status(200).json({
            ok: true,
            stats: {
                todayOrdersCount,
                totalSold,
                totalRefunds: totalPending,
                balance: balance._sum?.price || 0,
                workersCount
            }
        });
    } catch (error) {
        next(error);
    }
};
