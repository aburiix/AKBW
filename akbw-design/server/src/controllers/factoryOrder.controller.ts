import { prisma } from "../db/client.js";
import { type Request, type Response, type NextFunction } from "express";

export const getFactoryOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);
        const { status } = req.query;

        const where: any = {
            product: { factory_id: factoryId }
        };

        if (status) {
            where.status = status;
        }

        const orderItems = await prisma.orderItem.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        total_price: true,
                        state: true,
                        createdAt: true,
                        user: {
                            select: {
                                name: true,
                                lastName: true,
                                phone: true
                            }
                        }
                    }
                },
                product: {
                    include: {
                        translations: true
                    }
                },
                size: {
                    include: { translations: true }
                },
                color: {
                    include: { translations: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({ ok: true, orderItems });
    } catch (error) {
        next(error);
    }
};

export const updateOrderItemStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);
        const { id } = req.params;
        const { status } = req.body;

        const orderItem = await prisma.orderItem.findUnique({
            where: { id: Number(id) },
            include: { product: true }
        });

        if (!orderItem || orderItem.product.factory_id !== factoryId) {
            return res.status(403).json({ message: "Siz bu orderni boshqara olmaysiz", ok: false });
        }

        const updatedItem = await prisma.shipment.update({
            where: { id: Number(id) },
            data: { state: status }
        });

        return res.status(200).json({ ok: true, message: "Status yangilandi", orderItem: updatedItem });
    } catch (error) {
        next(error);
    }
};
