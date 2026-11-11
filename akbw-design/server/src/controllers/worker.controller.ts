import { prisma } from "../db/client.js";
import { type Request, type Response, type NextFunction } from "express";

export const getWorkers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);

        const workers = await prisma.workers.findMany({
            where: {
                factory_id: factoryId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({ ok: true, workers });
    } catch (error) {
        next(error);
    }
};

export const createWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);
        const { name, phone, role, tg_username } = req.body;

        const worker = await prisma.workers.create({
            data: {
                name,
                phone,
                role: role || "",
                tg_id: tg_username || "",
                factory_id: factoryId
            }
        });

        return res.status(201).json({ ok: true, worker, message: "Ishchi muvaffaqiyatli qo'shildi" });
    } catch (error) {
        next(error);
    }
};

export const updateWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);
        const { id } = req.params;
        const { name, phone, role, tg_id } = req.body;

        const worker = await prisma.workers.findUnique({
            where: { id: Number(id) }
        });

        if (!worker || worker.factory_id !== factoryId) {
            return res.status(403).json({ ok: false, message: "Sizda bu amalni bajarish uchun ruxsat yo'q" });
        }

        const updatedWorker = await prisma.workers.update({
            where: { id: Number(id) },
            data: {
                name,
                phone,
                role,
                tg_id
            }
        });

        return res.status(200).json({ ok: true, worker: updatedWorker, message: "Ishchi ma'lumotlari yangilandi" });
    } catch (error) {
        next(error);
    }
};

export const deleteWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);
        const { id } = req.params;

        const worker = await prisma.workers.findUnique({
            where: { id: Number(id) }
        });

        if (!worker || worker.factory_id !== factoryId) {
            return res.status(403).json({ ok: false, message: "Sizda bu amalni bajarish uchun ruxsat yo'q" });
        }

        await prisma.workers.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({ ok: true, message: "Ishchi o'chirildi" });
    } catch (error) {
        next(error);
    }
};
