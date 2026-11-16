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
        const { name, phone, role, tg_id, tg_username } = req.body;

        const worker = await prisma.workers.create({
            data: {
                name,
                phone,
                role: role || "",
                // Validator "tg_id" ni talab qiladi; eski "tg_username" ham qabul qilinadi
                tg_id: String(tg_id ?? tg_username ?? "").trim(),
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

// ---------------- Admin panel: barcha zavodlarning ishchilari ----------------
const TG_ID = /^\d{5,15}$/;
const clean = (v: unknown) => String(v ?? "").trim();

export const adminListWorkers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const workers = await prisma.workers.findMany({
            orderBy: { createdAt: "desc" },
            include: { factory: { select: { id: true, name: true } } },
        });
        return res.status(200).json({ ok: true, workers });
    } catch (error) {
        next(error);
    }
};

export const adminCreateWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = clean(req.body.name);
        const phone = clean(req.body.phone);
        const role = clean(req.body.role);
        const tg_id = clean(req.body.tg_id);
        const factory_id = Number(req.body.factory_id);
        if (!name || !phone) return res.status(400).json({ ok: false, message: "Ism va telefon majburiy" });
        if (!TG_ID.test(tg_id)) return res.status(400).json({ ok: false, message: "Telegram ID faqat raqamlardan iborat bo'lishi kerak (masalan: 123456789)" });
        const factory = Number.isInteger(factory_id) ? await prisma.factories.findUnique({ where: { id: factory_id }, select: { id: true } }) : null;
        if (!factory) return res.status(400).json({ ok: false, message: "Zavodni tanlang" });
        const exists = await prisma.workers.findUnique({ where: { tg_id } });
        if (exists) return res.status(409).json({ ok: false, message: "Bu Telegram ID bilan ishchi allaqachon bor" });
        const worker = await prisma.workers.create({
            data: { name, phone, role, tg_id, factory_id },
            include: { factory: { select: { id: true, name: true } } },
        });
        return res.status(201).json({ ok: true, worker, message: "Ishchi qo'shildi" });
    } catch (error) {
        next(error);
    }
};

export const adminUpdateWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const data: any = {};
        for (const k of ["name", "phone", "role"]) if (req.body[k] !== undefined) data[k] = clean(req.body[k]);
        if (req.body.tg_id !== undefined) {
            const tg = clean(req.body.tg_id);
            if (!TG_ID.test(tg)) return res.status(400).json({ ok: false, message: "Telegram ID faqat raqamlardan iborat bo'lishi kerak" });
            const other = await prisma.workers.findUnique({ where: { tg_id: tg } });
            if (other && other.id !== id) return res.status(409).json({ ok: false, message: "Bu Telegram ID boshqa ishchida bor" });
            data.tg_id = tg;
        }
        if (req.body.factory_id !== undefined) {
            const f = await prisma.factories.findUnique({ where: { id: Number(req.body.factory_id) }, select: { id: true } });
            if (!f) return res.status(400).json({ ok: false, message: "Zavod topilmadi" });
            data.factory_id = f.id;
        }
        const worker = await prisma.workers.update({
            where: { id },
            data,
            include: { factory: { select: { id: true, name: true } } },
        });
        return res.status(200).json({ ok: true, worker, message: "Saqlandi" });
    } catch (error) {
        next(error);
    }
};

export const adminDeleteWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.workers.delete({ where: { id: Number(req.params.id) } });
        return res.status(200).json({ ok: true, message: "Ishchi o'chirildi" });
    } catch (error) {
        next(error);
    }
};
