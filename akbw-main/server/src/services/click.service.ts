import {
    OrderState,
    TransactionState
} from "../generated/prisma/client/index.js";
import {
    ClickAction,
    ClickError
} from "../enum/clickTransaction.error.js";
import type {
    ClickComplete,
    ClickPrapere
} from "../types/click.types.js";
import {
    checkSignatureToken
} from "../utils/click.unit.js";
import {
    prisma
} from "../db/client.js";
import dotenv from "dotenv";
import { createShipmentsAfterPayment } from "../controllers/order.controller.js";

dotenv.config();


class ClickService {
    async Prapere({ click_trans_id,
        service_id,
        click_paydoc_id,
        merchant_trans_id,
        amount,
        action,
        error,
        error_note,
        sign_time,
        sign_string }: ClickPrapere) {
        try {
            console.log("==== CLICK PRAPERE ====");
            console.log({
                error,
                error_note,
                click_paydoc_id,
            });

            const order = await prisma.orders.findUnique({
                where: {
                    id: Number(merchant_trans_id)
                },
                include: {
                    orderItems: true,
                }
            });

            console.log("order: ", order);

            if (!order) {
                return {
                    error: ClickError.BadRequest,
                    error_note: "Product not found",
                }
            };

            const user = await prisma.user.findUnique({
                where: {
                    id: order.user_id,
                }
            });

            if (!user) {
                return {
                    error: ClickError.UserNotFound,
                    error_note: "User not found",
                }
            }

            console.log("user: ", user);

            const signature = {
                click_trans_id,
                service_id,
                order_id: order.id,
                amount,
                action,
                sign_time,
            };

            console.log("signature: ", signature);

            const isSigned = checkSignatureToken(sign_string, signature);

            console.log("isSigned: ", isSigned);

            if (!isSigned) {
                return {
                    error: ClickError.SignFailed,
                    error_note: "SIGN CHECK FAILED!",
                }
            };

            console.log("action: ", action)
            console.log("prepare: ", ClickAction.Prepare);

            if (action != ClickAction.Prepare) {
                return {
                    error: ClickError.ActionNotFound,
                    error_note: "Action not found",
                };
            };

            console.log("isNotPrepare: ", action !== ClickAction.Prepare);

            const isAlreadyPaid = await prisma.transactions.findFirst({
                where: {
                    user_id: user.id,
                    order_id: order.id,
                    provider: "click",
                    state: TransactionState.PAID,
                }
            });

            console.log("isAlreadyPaid: ", isAlreadyPaid);

            if (isAlreadyPaid) {
                return {
                    error: ClickError.AlreadyPaid,
                    error_note: "Already paid",
                }
            }

            console.log("===== CHECKING EVERY PRODUCT ===== ")

            for (const orderItem of order.orderItems) {
                const product = await prisma.products.findFirst({
                    where: {
                        id: orderItem.productId,
                    }
                });

                if (!product) {
                    return {
                        error: ClickError.BadRequest,
                        error_note: "Product not found",
                    }
                }
            };

            console.log("===== CHECKING EVERY PRODUCT DONE ======")

            console.log("==== AMOUNT CHECKING ====");
            console.log("amount: ", amount);
            console.log("total_price: ", order.total_price)

            if (amount != order.total_price) {
                return {
                    error: ClickError.InvalidAmount,
                    error_note: "Amount not match",
                }
            }

            const transaction = await prisma.transactions.findUnique({
                where: {
                    payment_provider_id: String(click_trans_id),
                }
            });

            console.log("transaction: ", transaction);

            if (transaction && transaction.state === TransactionState.CANCELLED) {
                return {
                    error: ClickError.TransactionCanceled,
                    error_note: "Transaction canceled",
                }
            };

            const time = new Date().getTime();

            const trans = await prisma.transactions.create({
                data: {
                    payment_provider_id: String(click_trans_id),
                    user_id: user.id,
                    order_id: order.id,
                    amount: Number(order.total_price),
                    provider: "click",
                    prapere_id: time,
                    transaction: merchant_trans_id,
                }
            });

            console.log("transaction created: ", trans);

            console.log("====DONE====", {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: time,
                error: ClickError.Success,
                error_note: 'Success',
            });

            return {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: time,
                error: ClickError.Success,
                error_note: 'Success',
            }
        } catch (error) {
            throw new Error("Click Prapere Error", { cause: error });
        }
    }

    async Complete({ click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string, error }: ClickComplete) {
        try {
            console.log("==== CLICK COMPLETE SERVICE ====");
            console.log({
                click_trans_id,
                service_id,
                merchant_trans_id,
                merchant_prepare_id,
                amount,
                action,
                sign_time,
                sign_string,
                error,
            });

            const order = await prisma.orders.findUnique({
                where: {
                    id: Number(merchant_trans_id),
                },
                include: {
                    orderItems: true,
                }
            });

            console.log("ORDER: ", order);

            if (!order) {
                return {
                    error: ClickError.BadRequest,
                    error_note: "Product not found",
                }
            };

            const signature = {
                click_trans_id,
                service_id,
                order_id: Number(order?.id),
                merchant_prepare_id: BigInt(merchant_prepare_id),
                amount: Number(amount),
                action: Number(action),
                sign_time: String(sign_time)
            };

            console.log("signature: ", signature);

            const checkSignature = checkSignatureToken(sign_string, signature);

            console.log("checkSignature: ", checkSignature);

            if (!checkSignature) {
                return { error: ClickError.SignFailed, error_note: 'Invalid sign' }
            };

            if (action != ClickAction.Complete) {
                return {
                    error: ClickError.ActionNotFound,
                    error_note: "Action not found",
                }
            };

            const user = await prisma.user.findUnique({
                where: {
                    id: order.user_id,
                }
            });

            console.log("user: ", user);

            if (!user) {
                return {
                    error: ClickError.UserNotFound,
                    error_note: "User not found",
                }
            };

            console.log("order: ", order);

            for (const orderItem of order.orderItems) {
                const product = await prisma.products.findFirst({
                    where: {
                        id: orderItem.productId,
                    }
                });

                if (!product) {
                    return {
                        error: ClickError.BadRequest,
                        error_note: "Product not found",
                    }
                }
            };

            const isPrepared = await prisma.transactions.findFirst({
                where: {
                    prapere_id: merchant_prepare_id,
                    provider: "click",
                }
            });

            console.log("isPrepared: ", isPrepared);

            if (!isPrepared) {
                return { error: ClickError.TransactionNotFound, error_note: 'Transaction not found' }
            }

            const isAlreadyPaid = await prisma.transactions.findFirst({
                where: {
                    user_id: user.id,
                    order_id: order.id,
                    provider: "click",
                    state: TransactionState.PAID,
                }
            });

            console.log("isAlreadyPaid: ", isAlreadyPaid);

            if (isAlreadyPaid) {
                return {
                    error: ClickError.AlreadyPaid,
                    error_note: "Already paid",
                }
            }

            if (amount != order.total_price) {
                return {
                    error: ClickError.InvalidAmount,
                    error_note: "Amount not match",
                }
            }

            const transaction = await prisma.transactions.findUnique({
                where: {
                    payment_provider_id: String(click_trans_id),
                }
            });

            console.log("transaction: ", transaction);

            if (transaction && transaction.state === TransactionState.CANCELLED) {
                return {
                    error: ClickError.TransactionCanceled,
                    error_note: "Transaction canceled",
                }
            };
            const time = new Date().getTime()

            if (error < 0) {
                await prisma.transactions.update({
                    where: {
                        payment_provider_id: String(click_trans_id),
                    },
                    data: {
                        state: TransactionState.CANCELLED,
                        cancel_time: time
                    }
                })
            };

            const [transaction_] = await prisma.$transaction([
                prisma.transactions.update({
                    where: {
                        payment_provider_id: String(click_trans_id),
                    },
                    data: {
                        state: TransactionState.PAID,
                        perform_time: time,
                    }
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

            await createShipmentsAfterPayment(order.id);

            console.log("===== DONE ===== ", {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: time,
                error: ClickError.Success,
                error_note: 'Success',
            });

            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: time,
                error: ClickError.Success,
                error_note: 'Success',
            }
        } catch (error) {
            throw new Error("Click Complete Error: ", { cause: error });
        }
    }
};

export default new ClickService();