import jwt from "jsonwebtoken";
import { prisma } from "../db/client.js";
import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, password } = req.body;


        const admin = await prisma.admins.findUnique({
            where: { phone },
            include: { access: true },
        });

        if (!admin) {
            return res.status(401).json({ ok: false, message: "Telefon raqami yoki parol noto'g'ri" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, message: "Telefon raqami yoki parol noto'g'ri" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: "30d" });
        const refreshToken = crypto.randomBytes(40).toString("hex");

        await prisma.admins.update({
            where: { id: admin.id },
            data: { refreshToken },
        });

        return res.status(200).json({
            ok: true,
            token,
            refreshToken,
            admin: {
                id: admin.id,
                name: admin.name,
                lastName: admin.lastName,
                phone: admin.phone,
                role: admin.role,
                access: admin.access,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await prisma.admins.findMany({
            include: {
                access: true
            }
        });
        return res.status(200).json(admins);
    } catch (error) {
        next(error);
    }
};

export const getAdminById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const admin = await prisma.admins.findUnique({
            where: { id: Number(id) },
            include: {
                access: true
            }
        });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json(admin);
    } catch (error) {
        next(error);
    }
};

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allreadyExists = await prisma.admins.findUnique({
            where: {
                phone: req.body.phone
            }
        });

        if (allreadyExists?.id) {
            return res.status(400).json({
                message: "User allready exists with this phone number you have to enter other phone number or delete the user",
                ok: false,
            })
        };

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const refreshToken = crypto.randomBytes(40).toString('hex');

        const newAdmin = await prisma.admins.create({
            data: {
                name: req.body.name,
                lastName: req.body.lastName,
                phone: req.body.phone,
                password: hashedPassword,
                role: req.body.role || 'Moderator',
                refreshToken: refreshToken,
                access: {
                    connectOrCreate: (req.body.access || []).map((name: string) => ({
                        where: { name },
                        create: { name }
                    }))
                },
            }
        })

        const adminToken = jwt.sign(
            { id: newAdmin.id },
            jwtSecret,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            message: "Admin created Successfully",
            ok: true,
            token: adminToken,
            refreshToken: refreshToken,
            admin: {
                id: newAdmin.id,
                name: newAdmin.name,
                lastName: newAdmin.lastName,
                phone: newAdmin.phone,
                role: newAdmin.role,
            }
        })
    } catch (error) {
        next(error);
    }
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, lastName, phone, role, access, password } = req.body;

        const updateData: any = {
            name,
            lastName,
            phone,
            role,
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (access) {
            updateData.access = {
                set: [],
                connectOrCreate: access.map((name: string) => ({
                    where: { name },
                    create: { name }
                }))
            };
        }

        const updatedAdmin = await prisma.admins.update({
            where: { id: Number(id) },
            data: updateData,
            include: {
                access: true
            }
        });

        return res.status(200).json({
            message: "Admin updated successfully",
            admin: updatedAdmin
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.admins.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({
            message: "Admin deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).json({
            message: "Admin data retrieved successfully",
            ok: true,
            admin: (req as any).admin,
        });
    } catch (error) {
        next(error);
    }
};

export const refreshAdminToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required", ok: false });
        }

        const admin = await prisma.admins.findUnique({
            where: { refreshToken }
        });

        if (!admin) {
            return res.status(401).json({ message: "Invalid refresh token", ok: false });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const newToken = jwt.sign(
            { id: admin.id },
            jwtSecret,
            { expiresIn: "7d" }
        );

        const newRefreshToken = crypto.randomBytes(40).toString('hex');

        await prisma.admins.update({
            where: { id: admin.id },
            data: { refreshToken: newRefreshToken }
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            ok: true,
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        next(error);
    }
};
