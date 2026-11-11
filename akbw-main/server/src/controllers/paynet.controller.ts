import type { PaynetRpcResponse } from "../types/payment.types.js";
import type { Request, Response, NextFunction } from "express";
import { paynetService } from "../services/paynet.service.js";

export const paynetWebhook = async (req: Request, res: Response, next: NextFunction) => {
    console.log("got payment requst: ", req.body);
    const { jsonrpc, method, params, id } = req.body;

    if (jsonrpc !== "2.0") {
        return res.json({
            jsonrpc: "2.0",
            error: { code: -32600, message: "Invalid Request" },
            id: id || null
        });
    }

    try {
        let result;
        switch (method) {
            case "GetInformation":
                result = await paynetService.GetInformation(params);
                break;
            case "PerformTransaction":
                result = await paynetService.PerformTransaction(params);
                break;
            case "CheckTransaction":
                result = await paynetService.CheckTransaction(params);
                break;
            case "CancelTransaction":
                result = await paynetService.CancelTransaction(params);
                break;
            case "GetStatement":
                result = await paynetService.GetStatement(params);
                break;
            default:
                return res.json({
                    jsonrpc: "2.0",
                    error: { code: -32601, message: "Method not found" },
                    id
                });
        }
        
        const response: PaynetRpcResponse = {
            jsonrpc: "2.0",
            result,
            id
        };

        console.log(`Paynet Response [${method}]:`, response);
        return res.json(response);

    } catch (error: any) {
        console.error(`Paynet Error [${method}]:`, error);
        const response: PaynetRpcResponse = {
            jsonrpc: "2.0",
            error: {
                code: error.code || -32000,
                message: error.message || "Internal error",
                data: error.data
            },
            id: id,
        };
        return res.json(response);
    }
};

export const getPaynetLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: "orderId and amount are required", ok: false });
        }

        const link = await paynetService.generatePaynetLink(Number(orderId), Number(amount));
        return res.json({ link, ok: true });
    } catch (error) {
        next(error);
    }
};
