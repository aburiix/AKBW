import type { NextFunction , Request, Response} from "express";
import logger from "../utils/loggers.js";
import axios from "axios";

export const redirectContacts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, phone, about} = req.body;

        const response = await axios.post(`https://api.telegram.org/bot${process.env.CONTACT_TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: process.env.CONTACT_TELEGRAM_ID,
            text: `Ism: ${name}\n Raqam: ${phone}\n Loyiha haqida: ${about}`,
        });

        return res.status(200).json(response.data);
    } catch (error) {
        logger.error("redirectContacts error: ", error);
        next(error);
    }
}