import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerFactory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name: name = "",
            payment_type: payment_type = "MONTH",
            phone: phone = "",
            adress: address = "",
            bts_region_code: bts_region_code = "",
            bts_city_code: bts_city_code = "",
            bts_branch_code: bts_branch_code = "",
            login: login = "",
            password: password = "",
            bank_name: bank_name = "",
            bank_account: bank_account = "",
            bank_mfo: bank_mfo = "",
            bank_inn: bank_inn = ""
        } = req.body;

        const existingFactory = await prisma.factories.findUnique({
            where: { login }
        });

        if (existingFactory) {
            return res.status(400).json({ message: "Zavod login allaqachon mavjud", ok: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const factory = await prisma.factories.create({
            data: {
                login,
                password: hashedPassword,
                name,
                phone,
                address,
                bts_region_code,
                bts_city_code,
                bts_branch_code,
                bank_name,
                bank_account,
                bank_mfo,
                bank_inn
            }
        });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const token = jwt.sign({ id: factory.id, role: "factory" }, jwtSecret);


        return res.status(201).json({
            token,
            message: "Zavod muvaffaqiyatli ro‘yxatdan o‘tdi",
            ok: true,
            factory: {
                id: factory.id,
                name: factory.name,
                login: factory.login
            }
        });
    } catch (error) {
        next(error);
    }
};

export const loginFactory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { login, password } = req.body;

        const factory = await prisma.factories.findUnique({
            where: { login }
        });

        if (!factory) {
            return res.status(404).json({ message: "Zavod topilmadi", ok: false });
        }

        const isPasswordValid = await bcrypt.compare(password, factory.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Noto‘g‘ri parol", ok: false });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const token = jwt.sign({ id: factory.id, role: "factory" }, jwtSecret);


        return res.status(200).json({
            token,
            message: "Muvaffaqiyatli kirildi",
            ok: true,
            factory: {
                id: factory.id,
                name: factory.name,
                login: factory.login
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMeFactory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const factoryId = Number(req.user);

        const factory = await prisma.factories.findUnique({
            where: { id: factoryId }
        });

        if (!factory) {
            return res.status(404).json({ message: "Zavod topilmadi", ok: false });
        }

        return res.status(200).json({ ok: true, factory });
    } catch (error) {
        next(error);
    }
};
