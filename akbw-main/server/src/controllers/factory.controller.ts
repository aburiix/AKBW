import { prisma } from "../db/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import type {
    Request,
    Response,
    NextFunction
} from "express";

export const createFactory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name: name = "",
            payment_type: payment_type = "MONTH",
            phone: phone = "",
            address: address = "",
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
            throw new Error("JWT_SECRET is not defined");
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

export const getAllFactories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const factories = await prisma.factories.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            omit: { password: true },
        });
        res.status(200).json({ ok: true, data: factories });
    } catch (error) {
        next(error);
    }
};

export const updateFactory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { 
            name,
            payment_type,
            phone,
            address,
            bts_region_code,
            bts_city_code,
            bts_branch_code,
            login,
            password,
            bank_name,
            bank_account,
            bank_mfo,
            bank_inn
         } = req.body;

        const data: any = {
            name,
            phone,
            address,
            bts_region_code,
            bts_city_code,
            bts_branch_code,
            payment_type,
            login,
            bank_name,
            bank_account,
            bank_mfo,
            bank_inn
        };

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const factory = await prisma.factories.update({
            where: { id: Number(id) },
            data
        });

        res.status(200).json({ ok: true, factory });
    } catch (error) {
        next(error);
    }
};

export const deleteFactory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await prisma.factories.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({ ok: true, message: "Factory deleted successfully" });
    } catch (error) {
        next(error);
    }
};