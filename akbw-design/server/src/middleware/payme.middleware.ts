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

        console.log("Authorization details:", {
            decodedData: data,
            merchantId,
            testKeyMatch: data === `Paycom:${testKey}` || data === `${merchantId}:${testKey}`,
            prodKeyMatch: data === `Paycom:${prodKey}` || data === `${merchantId}:${prodKey}`
        });

        const isAuthorized =
            data === `Paycom:${testKey}` ||
            data === `${merchantId}:${testKey}` ||
            data === `Paycom:${prodKey}` ||
            data === `${merchantId}:${prodKey}`;

        console.log("isAuth: ", isAuthorized);

        if (!isAuthorized) {
            console.log("Authorization failed for data:", data);
            throw new TransactionError(PaymeError.InvalidAuthorization, id);
        }
        console.log("Authorization successful");

        next();
    } catch (error) {
        next(error);
    }
};