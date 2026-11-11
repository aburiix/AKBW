import { prisma } from "../db/client.js"
import type { Request, Response, NextFunction } from "express";

const PAYME_STATE_TO_ENUM: Record<string, string> = {
    "1": "PENDING",
    "2": "PAID",
    "-1": "PENDING_CANCELLED",
    "-2": "PAID_CANCELLED",
};

const normalizeTransactionState = (state: string): string => {
    return PAYME_STATE_TO_ENUM[state] || state;
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await prisma.transactions.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        lastName: true,
                        phone: true,
                    }
                },
                order: true,
            },
            orderBy: {
                create_time: 'desc'
            }
        });

        const normalizedTransactions = transactions.map((transaction) => ({
            ...transaction,
            state: normalizeTransactionState(transaction.state),
        }));

        return res.status(200).json({ transactions: normalizedTransactions });
    } catch (err) {
        next(err);
    };
};