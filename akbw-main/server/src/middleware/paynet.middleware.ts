import type {
    Request,
    Response,
    NextFunction
} from "express";
import dotenv from "dotenv";
import {
    isIpInCidrs
} from "../utils/ip.util.js";

dotenv.config();


const PAYNET_WHITELIST = ['213.230.106.112/28', '213.230.65.80/28', "91.196.76.52", "89.236.220.222", "62.209.139.94", "94.158.63.240", "213.230.106.112/28", "213.230.65.80/28", "109.207.244.62", "109.207.244.94", "95.214.211.166", "94.158.63.245"];

export function basicAuth(req: Request, res: Response, next: NextFunction) {
    const clientIP: string = req.ip || req.socket.remoteAddress || "";
    const isAllowed: boolean = isIpInCidrs(clientIP, PAYNET_WHITELIST);

    console.log("isAllowed: ", isAllowed);

    if(!isAllowed) {
        return res.sendStatus(403);
    };

    const USERNAME = process.env.PAYNET_USERNAME;
    const PASSWORD = process.env.PAYNET_PASSWORD;

    console.log("Paynet Auth Middleware: Checking credentials");
    console.log({
        "username": USERNAME ? USERNAME : "not configured",
        "password": PASSWORD ? PASSWORD : "not configured",
    });

    if (!USERNAME || !PASSWORD) {
        console.error("Paynet credentials not configured in environment variables");
        return res.sendStatus(500);
    }

    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Basic ")) {
        console.log("Paynet Auth Middleware: No valid authorization header");
        return res.sendStatus(401);
    }

    const base64: string = String(auth.split(" ")[1]);
    const [user, pass] = Buffer.from(base64, "base64").toString().split(":");
    console.log("Paynet Auth Middleware: Decoded credentials", { user, pass });

    if (user !== USERNAME || pass !== PASSWORD) {
        console.log("Paynet Auth Middleware: Invalid credentials");

        return res.sendStatus(401);
    };

    next();
}
