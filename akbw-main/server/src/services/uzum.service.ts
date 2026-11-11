import { prisma } from "../db/client.js";
import { TransactionState } from "../enum/transaction.error.js";
import { TransactionState as PrismaTS } from "../generated/prisma/client/index.js";
import {
    UzumBaseError
} from "../errors/uzum.errors.js";
import dotenv from "dotenv";

dotenv.config();

class UzumService {
    async check(data: any) {
        const { serviceId, params } = data;
        const { order_id, user_id } = params;

        if (this.checkServiceId(serviceId)) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'));
        };

        const order = await prisma.orders.findUnique({
            where: {
                id: order_id
            }
        });

        if (!order) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
        };

        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
            }
        });

        if (!user) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
        }

        return { serviceId, timestamp: Date.now(), status: 'OK', data: { params } }
    };
    async create(data: any) {
        const { serviceId, params, transId, amount } = data
        const { user_id, order_id } = params

        if (!this.checkServiceId(serviceId)) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
        }

        const existingTransaction = await prisma.transactions.findFirst({
            where: {
                payment_provider_id: transId,
                order_id: order_id,
                user_id: user_id,
            }
        });

        if (existingTransaction) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionAlreadyExists'))
        }

        const order = await prisma.orders.findUnique({
            where: {
                id: order_id
            }
        });
        if (!order) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ProductNotFound'))
        }

        if (order.total_price !== amount / 100) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'InvalidAmount'))
        }

        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
            }
        });
        if (!user) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'UserNotFound'))
        }

        await prisma.transactions.create({
            data: {
                payment_provider_id: transId,
                amount,
                user_id: user_id,
                order_id: order_id,
                provider: 'uzum',
                state: PrismaTS.PENDING,
                transaction: transId,
            }
        });

        return { serviceId, timestamp: Date.now(), status: 'CREATED', transTime: Date.now(), transId, amount }
    };
    async confirm(data: any) {
        const { serviceId, transId } = data

        if (!this.checkServiceId(serviceId)) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
        }

        const transaction = await prisma.transactions.findFirst({
            where: { payment_provider_id: transId }
        })
        if (!transaction) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionNotFound'))
        }

        if (transaction.state !== String(TransactionState.Pending)) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionAlreadyConfirmed'))
        }

        if (transaction.provider !== 'uzum') {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'InvalidProvider'))
        }


        await prisma.transactions.update({
            where: {
                payment_provider_id: String(transId),
            },
            data: {
                state: PrismaTS.PAID,
                perform_time: BigInt(new Date().getTime())
            }
        });

        return { serviceId, transId, status: 'CONFIRMED', confirmTime: Date.now() }
    };
    async reverse(data: any) {
        const { serviceId, transId } = data
        if (!this.checkServiceId(serviceId)) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
        }

        const transaction = await prisma.transactions.findFirst({ where: { payment_provider_id: transId } })
        if (!transaction) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionNotFound'))
        }

        await prisma.transactions.update({
            where: {
                payment_provider_id: transId,
            },
            data: {
                state: PrismaTS.PAID_CANCELLED,
                cancel_time: BigInt(new Date().getTime())
            }
        });

        return { serviceId, transId, status: 'REVERSED', reverseTime: Date.now(), amount: transaction.amount }
    };
    async status(data: any) {
        const { serviceId, transId } = data
        if (!this.checkServiceId(serviceId)) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'ErrorCheckingPaymentData'))
        }

        const transaction = await prisma.transactions.findFirst({ where: { payment_provider_id: transId } })
        if (!transaction) {
            throw UzumBaseError.BadRequest(this.createErrorResponse(serviceId, 'TransactionNotFound'))
        }

        return { serviceId, transId, status: 'CONFIRMED' }
    };

    checkServiceId(serviceId: string | number) {
        return +serviceId === +String(process.env.UZUM_SERVICE_ID)
    };

    createError(serviceId: string | number, errorCode: number | string) {
        return { serviceId, timestamp: Date.now(), status: 'FAILED', errorCode }
    };

    createErrorResponse(serviceId: string | number, errorCode: number | string) {
        return this.createError(serviceId, errorCode);
    };
}


export default new UzumService();