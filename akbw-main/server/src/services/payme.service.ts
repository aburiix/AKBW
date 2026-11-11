import { createShipmentsAfterPayment } from "../controllers/order.controller.js";
import { OrderState } from "../generated/prisma/client/index.js";
import TransactionError from "../errors/transaction.errors.js";
import {
    PaymeError,
    TransactionState
} from "../enum/transaction.error.js";
import {
    PaymeData
} from "../enum/transaction.error.js";
import {
    prisma
} from "../db/client.js";


class PaymeService {
    async checkPerformTransaction(params: any, id: string) {
        const { amount, account } = params;

        const user = await prisma.user.findUnique({
            where: {
                id: String(account.user_id)
            }
        });

        if (!user) {
            throw new TransactionError(PaymeError.UserNotFound, id, PaymeData.user_id);
        };

        const product = await prisma.orders.findUnique({
            where: {
                id: Number(account.order_id)
            }
        });

        if (!product) {
            throw new TransactionError(PaymeError.ProductNotFound, id, PaymeData.order_id);
        };

        const amountInCent = Math.floor(amount / 100);

        if (amountInCent !== product.total_price) {
            throw new TransactionError(PaymeError.InvalidAmount, id);
        };
    };

    async checkTransaction(params: any, id: string) {
        const transaction = await prisma.transactions.findUnique({ where: { payment_provider_id: params.id } });

        if (!transaction) {
            throw new TransactionError(PaymeError.TransactionNotFound, id)
        };

        return {
            create_time: transaction.create_time ? transaction.create_time.getTime() : 0,
            perform_time: transaction.perform_time ? Number(transaction.perform_time) : 0,
            cancel_time: transaction.cancel_time ? Number(transaction.cancel_time) : 0,
            transaction: String(transaction.id),
            state: parseInt(transaction.state),
            reason: transaction.reason ? parseInt(transaction.reason) : null,
        };
    };

    async createTransaction(params: any, id: string) {
        let { account, time, amount } = params

        amount = Math.floor(amount / 100)
        console.log("amount: ", amount);

        let transaction = await prisma.transactions.findUnique({ where: { payment_provider_id: params.id } })
        console.log("createTransaction: ", transaction);

        if (transaction) {
            if (transaction.state != String(TransactionState.Pending)) {
                console.log("createTransaction: ", transaction, "is not pending");
                throw new TransactionError(PaymeError.CantDoOperation, id)
            }
            const currentTime = Date.now()
            const minutesPassed =
                (currentTime - transaction.create_time.getTime()) / 60000;

            const isExpired = minutesPassed >= 12;

            if (isExpired) {
                console.log("createTransaction: ", transaction, "is expired");
                await prisma.transactions.update({
                    where: { payment_provider_id: params.id },
                    data: {
                        state: String(TransactionState.PendingCanceled),
                        reason: String(4),
                    },
                });

                throw new TransactionError(PaymeError.CantDoOperation, id);
            };

            return {
                create_time: transaction.create_time.getTime(),
                transaction: transaction.id.toString(),
                state: TransactionState.Pending,
            }
        };

        const existingTransaction = await prisma.transactions.findFirst({
            where: {
                user_id: String(account.user_id),
                state: String(TransactionState.Pending),
                order_id: Number(account.order_id),
                payment_provider_id: {
                    not: params.id
                }
            }
        });

        if (existingTransaction) {
            throw new TransactionError(PaymeError.Pending, id);
        };

        await this.checkPerformTransaction(params, id);

        const order = await prisma.orders.findUnique({ where: { id: Number(account.order_id) } })

        if (!order) {
            throw new TransactionError(PaymeError.ProductNotFound, id)
        };

        const newTransaction = await prisma.transactions.create({
            data: {
                payment_provider_id: params.id,
                user_id: String(account.user_id),
                order_id: Number(account.order_id),
                state: String(TransactionState.Pending),
                create_time: new Date(time),
                transaction: params.id,
                amount: amount,
                provider: "payme",
            }
        });

        return {
            transaction: newTransaction.id.toString(),
            state: TransactionState.Pending,
            create_time: newTransaction.create_time.getTime(),
        }
    }

    async performTransaction(params: any, id: string) {
        const transaction_id = params.id;
        const currentTime = Date.now();

        const transaction = await prisma.transactions.findUnique({
            where: {
                payment_provider_id: String(transaction_id)
            }
        });

        if (!transaction) {
            throw new TransactionError(PaymeError.TransactionNotFound, id);
        };


        if (transaction.state !== String(TransactionState.Pending)) {
            if (transaction.state !== String(TransactionState.Paid)) {
                throw new TransactionError(PaymeError.CantDoOperation, id);
            } else {
                return {
                    state: TransactionState.Paid,
                    perform_time: Number(transaction.perform_time),
                    transaction: transaction.id.toString(),
                }
            }
        }

        const expirationTime = (currentTime - transaction.create_time.getTime()) / 60000 < 12;

        if (!expirationTime) {
            await prisma.transactions.update({ where: { payment_provider_id: transaction_id }, data: { state: String(TransactionState.PendingCanceled), reason: String(4), cancel_time: new Date().getTime() } });
            throw new TransactionError(PaymeError.CantDoOperation, id)
        };

        const [transaction_] = await prisma.$transaction([
            prisma.transactions.update({
                where: { payment_provider_id: transaction_id },
                data: { state: String(TransactionState.Paid), perform_time: new Date().getTime() }
            }),
            prisma.orders.update({
                where: {
                    id: Number(transaction?.order_id),
                },
                data: {
                    state: OrderState.PAID,
                }
            })
        ])

        // Create shipments after successful payment
        if (transaction_.order_id) {
            await createShipmentsAfterPayment(transaction_.order_id);
        }

        return {
            state: TransactionState.Paid,
            perform_time: Number(transaction_.perform_time),
            transaction: transaction_.id.toString(),
        };
    };

    async cancelTransaction(params: any, id: string) {
        const transaction_id = params.id;
        const reason = params.reason;

        const transaction = await prisma.transactions.findUnique({
            where: {
                payment_provider_id: transaction_id
            }
        });


        if (!transaction) {
            throw new TransactionError(PaymeError.TransactionNotFound, id);
        };

        if (transaction.state === String(TransactionState.Pending)) {
            const updatedTransaction = await prisma.transactions.update({
                where: { payment_provider_id: transaction_id },
                data: {
                    state: String(TransactionState.PendingCanceled),
                    cancel_time: Number(new Date().getTime()),
                    reason: String(reason)
                }
            });
            return {
                state: TransactionState.PendingCanceled,
                cancel_time: Number(updatedTransaction.cancel_time),
                transaction: updatedTransaction.id.toString(),
            };
        }

        if (transaction.state === String(TransactionState.Paid)) {
            const updatedTransaction = await prisma.transactions.update({
                where: { payment_provider_id: transaction_id },
                data: {
                    state: String(TransactionState.PaidCanceled),
                    cancel_time: Number(new Date().getTime()),
                    reason: String(reason)
                }
            });
            return {
                state: TransactionState.PaidCanceled,
                cancel_time: Number(updatedTransaction.cancel_time),
                transaction: updatedTransaction.id.toString(),
            };
        };

        return {
            state: parseInt(transaction.state),
            cancel_time: Number(transaction.cancel_time),
            transaction: transaction.id.toString(),
        };
    };

    async getStatement(params: any, id: string) {
        const { from, to } = params
        const transactions = await prisma.transactions.findMany({ where: { create_time: { gte: new Date(from), lte: new Date(to) } } })

        return transactions.map(transaction => ({
            id: transaction.payment_provider_id,
            time: transaction.create_time.getTime(),
            amount: transaction.amount,
            account: {
                account_id: transaction.user_id,
                order_id: transaction.order_id
            },
            create_time: Number(transaction.create_time.getTime()),
            perform_time: transaction.perform_time ? Number(transaction.perform_time) : 0,
            cancel_time: transaction.cancel_time ? Number(transaction.cancel_time) : 0,
            transaction: transaction.id.toString(),
            state: parseInt(transaction.state),
            reason: transaction.reason ? parseInt(transaction.reason) : null,
        }))
    }

    async generatePaymeLink(orderId: number, amount: number, userId: string): Promise<string> {
        const merchantId = process.env.PAYME_ID?.replace(/['"]/g, '');

        const params = `m=${merchantId};ac.order_id=${orderId};ac.user_id=${userId};a=${amount * 100}`;
        const encodedParams = Buffer.from(params).toString('base64');

        return `https://checkout.payme.uz/${encodedParams}`;
    };
};

export {
    PaymeService
};