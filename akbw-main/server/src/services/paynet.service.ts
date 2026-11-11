import {
    OrderState,
    TransactionState
} from "../generated/prisma/client/index.js";
import type {
    GetStatementParams,
    PaynetParams
} from "../types/payment.types.js";
import { prisma } from "../db/client.js";
import dotenv from "dotenv";
import { toPaynetTimestamp, toUZTString } from "../utils/time.util.js";
import { createShipmentsAfterPayment } from "../controllers/order.controller.js";

dotenv.config();

class PaynetService {
    async GetInformation(params: PaynetParams) {
        const { fields, serviceId } = params;
        const orderId = fields?.order_id || fields?.client_id;
        console.log("GetInformation called with params: ", params);
        console.log("GetInformation called with params: ", orderId);

        const validServiceId = process.env.PAYNET_SERVICE_ID;
        if (String(serviceId) !== String(validServiceId)) {
            throw { code: 305, message: "Услуга не найдена" };
        };

        if (!fields || !orderId) {
            throw { code: -32602, message: "order_id or client_id is required" };
        }

        const order = await prisma.orders.findUnique({
            where: { id: Number(orderId) },
            include: { user: true }
        });

        console.log("Order found: ", order);

        if (!order) {
            throw { code: 302, message: "Order not found" };
        }

        if (order.state === OrderState.PAID) {
            throw { code: 302, message: "Клиент не найден" };
        };

        console.log("response for GetInformation: ", {
            additional: {
                client_name: `${order.user.name} ${order.user.lastName}`,
                amount: order.total_price,
                order_state: order.state
            }
        });

        return {
            status: "0",
            timestamp: toPaynetTimestamp(new Date()),
            fields: {
                client_name: `${order.user.name} ${order.user.lastName}`,
                amount: order.total_price,
                order_state: String(order.state),
            }
        };
    };

    private toPaynetTransactionState(state: TransactionState): number {
        if (state === TransactionState.PAID) return 1;
        if (
            state === TransactionState.CANCELLED ||
            state === TransactionState.PAID_CANCELLED ||
            state === TransactionState.PENDING_CANCELLED
        ) {
            return 2;
        }
        return 3;
    }

    private formatPerformResult(
        providerTrnId: number,
        fields: PaynetParams["fields"],
        createTime: Date
    ) {
        return {
            providerTrnId,
            timestamp: toPaynetTimestamp(createTime),
            fields: fields ?? {},
        };
    }

    async PerformTransaction(params: PaynetParams) {
        const { transactionId, amount, fields, serviceId } = params;
        const orderId = fields?.order_id || fields?.client_id;
        console.log("PerformTransaction called with params: ", params);
        console.log("orderId: ", orderId);

        const validServiceId = process.env.PAYNET_SERVICE_ID;
        if (String(serviceId) !== String(validServiceId)) {
            throw { code: 305, message: "Услуга не найдена" };
        }

        if (!transactionId || amount == null) {
            throw { code: -32602, message: "transactionId and amount are required" };
        }

        const real_amount = amount / 100;

        if (!orderId) {
            throw { code: -32602, message: "order_id or client_id is required" };
        }

        const order = await prisma.orders.findUnique({
            where: { id: Number(orderId) }
        });
        console.log("Order found: ", order);

        if (!order) {
            throw { code: 302, message: "Order not found" };
        };

        console.log("Order found: ", order);

        if (order.state === OrderState.PAID) {
            const existingTx = await prisma.transactions.findUnique({
                where: { payment_provider_id: String(transactionId) }
            });
            if (existingTx && existingTx.state === TransactionState.PAID) {
                // Return the formatted result for the existing transaction
                // This is used when the transaction is Транзакция уже существует
                //return this.formatPerformResult(
                //    existingTx.id,
                //    fields,
                //    existingTx.create_time
                //   );
                throw { code: 201, message: "Транзакция уже существует" };
            };
            throw { code: 201, message: "Транзакция уже существует" };
        };

        console.log("Validating amount: ", amount, " against order total_price: ", order.total_price);
        if (order.total_price !== real_amount) {
            throw { code: 413, message: "Invalid amount" };
        };
        
        const now = new Date();
        const performTime = BigInt(now.getTime());

        const [transaction] = await prisma.$transaction([
            prisma.transactions.create({
                data: {
                    payment_provider_id: String(transactionId),
                    order_id: order.id,
                    user_id: order.user_id,
                    amount: amount,
                    provider: "paynet",
                    state: TransactionState.PAID,
                    create_time: now,
                    perform_time: performTime,
                    transaction: String(transactionId)
                }
            }),
            prisma.orders.update({
                where: { id: order.id },
                data: { state: OrderState.PAID }
            })
        ]);

        // Create shipments after successful payment
        await createShipmentsAfterPayment(order.id);

        const result = this.formatPerformResult(transaction.id, fields, transaction.create_time);
        console.log("Transaction response: ", result);
        return result;
    }

    async CheckTransaction(params: PaynetParams) {
        console.log("CheckTransaction called with params: ", params);
        const { transactionId } = params;
        console.log("transactionId: ", transactionId);

        const transaction = await prisma.transactions.findUnique({
            where: { payment_provider_id: String(transactionId) }
        });
        console.log("Transaction found: ", transaction);

        if (!transaction) {
            throw { code: 302, message: "Transaction not found" };
        }

        const result = {
            providerTrnId: transaction.id,
            transactionState: this.toPaynetTransactionState(transaction.state as TransactionState),
            timestamp: toUZTString(transaction.create_time),
        };
        console.log("response for CheckTransaction: ", result);
        return result;
    }

    async CancelTransaction(params: PaynetParams) {
        const { transactionId } = params;

        console.log("CancelTransaction called with params: ", params);
        console.log("transactionId: ", transactionId);

        const transaction = await prisma.transactions.findUnique({
            where: { payment_provider_id: String(transactionId) }
        });

        console.log("Transaction found: ", transaction);

        if (!transaction) {
            throw { code: 302, message: "Transaction not found" };
        }

        if (transaction.state === TransactionState.CANCELLED || transaction.state === TransactionState.PAID_CANCELLED) {
            console.log("Transaction already cancelled or paid_cancelled");
            console.log("response for CancelTransaction (already cancelled): ", {
                transactionId: transaction.id.toString(),
                state: transaction.state,
                cancelTime: transaction.cancel_time ? Number(transaction.cancel_time) : Date.now()
            });
            throw {
                code: 202,
                message: "Транзакция уже отменена или отменена и возвращена"
            };
        }

        const newState = transaction.state === TransactionState.PAID ? TransactionState.PAID_CANCELLED : TransactionState.CANCELLED;

        const updatedTx = await prisma.transactions.update({
            where: { payment_provider_id: String(transactionId) },
            data: {
                state: newState,
                cancel_time: BigInt(Date.now())
            }
        });

        console.log("Transaction updated: ", updatedTx);

        if (transaction.state === TransactionState.PAID) {
            console.log("Updating order to cancelled for order_id: ", transaction.order_id);
            await prisma.orders.update({
                where: { id: Number(transaction.order_id) },
                data: { state: OrderState.CANCELLED }
            });
        }

        const result = {
            providerTrnId: updatedTx.id,
            transactionState: this.toPaynetTransactionState(updatedTx.state as TransactionState),
            timestamp: toPaynetTimestamp(
                updatedTx.cancel_time
                    ? new Date(Number(updatedTx.cancel_time))
                    : new Date()
            ),
        };
        console.log("response for CancelTransaction: ", result);
        return result;
    }

    async GetStatement(params: GetStatementParams) {
        const { serviceId, dateFrom, dateTo } = params;

        console.log("GetStatement called with params: ", params);

        const transactions = await prisma.transactions.findMany({
            where: {
                provider: "paynet",
                create_time: {
                    gte: new Date(dateFrom),
                    lte: new Date(dateTo)
                },
            }
        });

        const statements = transactions.map(tx => ({
            amount: tx.amount,
            transactionId: Number(tx.payment_provider_id),
            providerTrnId: tx.id,
            timestamp: toPaynetTimestamp(tx.create_time),
        }));

        return { statements };
    };

    async generatePaynetLink(orderId: number, amount: number): Promise<string> {
        const serviceId = process.env.PAYNET_SERVICE_ID;
        const baseUrl = "https://app.paynet.uz/";
        return `${baseUrl}?m=51823&i=${orderId}`;
    };
};

export const paynetService = new PaynetService();