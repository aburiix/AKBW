import clickService from "../services/click.service.js";
import uzumService from "../services/uzum.service.js";
import {
    OrderState
} from "../generated/prisma/client/index.js";
import {
    PaymeService
} from "../services/payme.service.js";
import {
    PaymeMethod
} from "../enum/transaction.error.js";
import {
    prisma
} from "../db/client.js";
import type {
    Request,
    Response,
    NextFunction
} from "express"

const paymeService = new PaymeService();

export const paymePay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("this is payme webghook: ", req.body);
        const { method, params, id } = req.body;

        switch (method) {
            case PaymeMethod.CheckPerformTransaction: {
                await paymeService.checkPerformTransaction(params, id);
                return res.json({ result: { allow: true } });
            };
            case PaymeMethod.CheckTransaction: {
                const result = await paymeService.checkTransaction(params, id);
                return res.json({ result, id });
            };
            case PaymeMethod.CreateTransaction: {
                const result = await paymeService.createTransaction(params, id);
                return res.json({ result, id });
            };
            case PaymeMethod.PerformTransaction: {
                const result = await paymeService.performTransaction(params, id);
                return res.json({ result, id });
            };
            case PaymeMethod.CancelTransaction: {
                const result = await paymeService.cancelTransaction(params, id);
                return res.json({ result, id });
            };
            case PaymeMethod.GetStatement: {
                const result = await paymeService.getStatement(params, id);
                return res.json({ result: { transactions: result } });
            };
        }
    } catch (error) {
        next(error);
    }
}

export const paymeCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("payme webhook: ", req.body);
        return res.json({ ok: true });
    } catch (error) {
        next(error);
    }
}

export const getPaymeLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, amount } = req.body;
        const userId = req.user;

        if (!orderId || !amount) {
            return res.status(400).json({ message: "Order ID and amount are required", ok: false });
        }

        const link = await paymeService.generatePaymeLink(Number(orderId), Number(amount), userId);
        return res.json({ link, ok: true });
    } catch (error) {
        next(error);
    }
}

export const clickPrapere = async (req: Request, res: Response, next: NextFunction) => {
    console.log("click prapere router")
    try {
        const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            amount,
            action,
            error,
            error_note,
            sign_time,
            sign_string
        } = req.body;

        const result = await clickService.Prapere({
            click_paydoc_id,
            click_trans_id,
            service_id,
            merchant_trans_id,
            amount,
            action,
            error,
            error_note,
            sign_string,
            sign_time
        });

        console.log("this is click response: ", result);
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export const clickComplete = async (req: Request, res: Response, next: NextFunction) => {
    console.log("click complete router")
    try {
        const {
            click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string, error
        } = req.body;

        const result = await clickService.Complete({
            click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string, error
        });

        console.log("result of click complete: ", result);

        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export const clickCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { order_id, amount } = req.body;
        const SERVICE_ID = process.env.CLICK_SERVICE_ID;
        const MERCHANT_ID = process.env.CLICK_MERCHANT_ID;
        //const MERCHANT_USER_ID = process.env.CLICK_MERCHANT_USER_ID;

        const order = await prisma.orders.findUnique({
            where: {
                id: Number(order_id),
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found", ok: false });
        };

        if(!user){
            return res.status(401).json({ message: "Unauthorized", ok: false });
        };
        
        const user_ = await prisma.user.findUnique({
            where: {
                id: user
            }
        });

        if (!user_) {
            return res.status(404).json({ message: "User not found", ok: false });
        };

        const checkout_url
            =
            `https://my.click.uz/services/pay?service_id=${SERVICE_ID}&merchant_id=${MERCHANT_ID}&amount=${amount}&transaction_param=${order_id}&return_url=${process.env.CLICK_RETURN_URL}`;

        return res.json({ link: checkout_url, ok: true });
    } catch (error) {
        next(error);
    }
};

export const uzumCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await uzumService.check(req.body);
        res.json(data)
    } catch (error) {
        next(error);
    }
};

export const uzumCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await uzumService.create(req.body);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

export const uzumConfirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await uzumService.confirm(req.body)
        res.json(data)
    } catch (error) {
        next(error)
    }
};

export const uzumReverse = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const data = await uzumService.reverse(req.body)
        res.json(data)
    } catch (error) {
        next(error)
    }
};

export const uzumStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await uzumService.status(req.body)
        res.json(data)
    } catch (error) {
        next(error)
    }
};