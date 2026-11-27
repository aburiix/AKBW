import type {
    NextFunction,
    Request,
    Response
} from "express";
import fs from "node:fs";
import path from "node:path";
import {
    prisma
} from "../db/client.js";

/** O'chirilgan akkaunt telefoni shu bilan boshlanadi (raqam bo'shaydi, qayta ro'yxatdan o'tsa bo'ladi). */
export const DELETED_PHONE_PREFIX = "deleted:";


export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsers controller:", error);
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;
        const user = await prisma.user.findUnique({
            where: { id: user_id },
            include: {
                reviews: true,
                orders: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found", ok: false });
        }

        return res.status(200).json({ data: user, ok: true });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;
        const { name, lastName, gender, profile_picture, birthDate, region, district, email } = req.body;

        // faqat yuborilgan maydonlar yangilanadi
        const data: Record<string, unknown> = {};
        if (name !== undefined) data.name = name;
        if (lastName !== undefined) data.lastName = lastName;
        if (gender !== undefined) data.gender = gender;
        if (profile_picture !== undefined) data.profile_picture = profile_picture;
        if (birthDate) data.birthDate = new Date(birthDate);
        if (region !== undefined) data.region = region;
        if (district !== undefined) data.district = district;
        // bo'sh satr — emailni o'chirish
        if (email !== undefined) data.email = String(email).trim().toLowerCase() || null;

        const user = await prisma.user.update({
            where: { id: user_id },
            data: data as any,
        });

        return res.status(200).json({ message: "Profile updated successfully", data: user, ok: true });
    } catch (error) {
        next(error);
    }
};


/**
 * DELETE /api/user/me — foydalanuvchi o'z akkauntini o'chiradi (App Store 5.1.1(v) talabi).
 * Shaxsiy ma'lumot o'chiriladi: ism, telefon, rasm, kirish tokeni, AI suhbatlari va xotirasi,
 * kiyib ko'rish rasmlari, yordam chatidagi xabarlari. Buyurtma va to'lov yozuvlari
 * (buxgalteriya, Payme/Click) shaxssiz holda saqlanadi.
 */
export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = (req as any).user as string;
        const user = await prisma.user.findUnique({
            where: { id },
            select: { phone: true, tryOns: { select: { resultUrl: true } } },
        });
        if (!user || user.phone.startsWith(DELETED_PHONE_PREFIX)) {
            return res.status(404).json({ message: "User not found", ok: false });
        }

        await prisma.$transaction([
            prisma.assistantThread.deleteMany({ where: { userId: id } }),
            prisma.assistantMemory.deleteMany({ where: { userId: id } }),
            prisma.tryOn.deleteMany({ where: { userId: id } }),
            prisma.helpChatMessages.deleteMany({ where: { sender_id: id } }),
            prisma.askForChatMessages.deleteMany({ where: { sender_id: id } }),
            prisma.user.update({
                where: { id },
                data: {
                    phone: `${DELETED_PHONE_PREFIX}${id}`,
                    name: "O'chirilgan",
                    lastName: "foydalanuvchi",
                    gender: "",
                    profile_picture: "",
                    refreshToken: null,
                },
            }),
        ]);

        // kiyib ko'rish natija fayllari diskdan ham o'chiriladi
        const dir = path.join(process.cwd(), "uploads", "tryon");
        for (const t of user.tryOns) {
            const file = t.resultUrl.split("/uploads/tryon/")[1];
            if (file && /^[\w-]+\.jpg$/.test(file)) fs.rm(path.join(dir, file), { force: true }, () => {});
        }

        return res.status(200).json({ message: "Account deleted", ok: true });
    } catch (error) {
        next(error);
    }
};
