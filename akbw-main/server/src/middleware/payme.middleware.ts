import TransactionError from "../errors/transaction.errors.js";
import {
    PaymeError
} from "../enum/transaction.error.js";

import type {
    NextFunction,
    Request,
    Response
} from "express";
import dotenv from "dotenv";
import { safeEqual } from "../utils/safeEqual.util.js";

dotenv.config();

export const paymeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;

        const auth = req.headers.authorization;
        const token = auth && auth.split(' ')[1];
        if (!token) throw new TransactionError(PaymeError.InvalidAuthorization, id);
        const data = Buffer.from(token, 'base64').toString('utf-8');

        const testKey = process.env.PAYME_TEST_KEY?.replace(/['"]/g, '');
        const prodKey = process.env.PAYME_PROD_KEY?.replace(/['"]/g, '');
        const merchantId = process.env.PAYME_ID?.replace(/['"]/g, '');

        // Kalit loglarga yozilmaydi
        const candidates = [testKey, prodKey]
            .filter((k): k is string => !!k)
            .flatMap((k) => [`Paycom:${k}`, ...(merchantId ? [`${merchantId}:${k}`] : [])]);
        const isAuthorized = candidates.some((c) => safeEqual(data, c));

        if (!isAuthorized) {
            console.warn(`[payme] avtorizatsiya rad etildi ip=${req.ip}`);
            throw new TransactionError(PaymeError.InvalidAuthorization, id);
        }

        next();
    } catch (error) {
        next(error);
    }
};