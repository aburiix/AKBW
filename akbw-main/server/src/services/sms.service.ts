import axios from "axios";
// import {
//     sendSms
// } from "../config/telegram.js";
import type {
    IGetTokenResponse,
    IRefreshExistingTokenResponse,
    ISendSmsResponse
} from "../types/sms.types.js";
import dotenv from "dotenv";

dotenv.config();


// Sending sms via Telegram, it can be useable in the future os i decided to pass it

// const telegramSms = async (text: string, chatId?: string) => {
//     try {
//         const token = process.env.TELEGRAM_BOT_TOKEN;
//         const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;

//         if (!token || !targetChatId) {
//             console.error("Telegram credentials missing in environment variables");
//             return;
//         }

//         await axios(sendSms(token, targetChatId, text));
//     } catch (error) {
//         console.error("Telegram SMS service error:", error);
//         throw new Error("Something went wrong with sms service")
//     }
// }

class SmsService {
    private baseUrl: string = String(process.env.ESKIZ_BASE_URL);
    private username: string = String(process.env.ESKIZ_USERNAME);
    private password_token: string = String(process.env.ESKIZ_PASSWORD);
    private token: string | null = null;

    async getToken(): Promise<IGetTokenResponse> {
        try {
            const data = new FormData();
            data.append("email", this.username);
            data.append("password", this.password_token);

            console.log("getToken data: ", data);

            const response = await axios.post(`${this.baseUrl}/auth/login`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            this.token = response.data.data.token;
            return response.data;
        } catch (error) {
            console.error("Failed to get Eskiz token:", error);
            throw error;
        }
    };

    async refreshToken(): Promise<IRefreshExistingTokenResponse> {
        try {
            const response = await axios.patch(`${this.baseUrl}/auth/refresh`, {}, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            });

            console.log(response.data);

            this.token = response.data.data.token;
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    async sendSms({
        phone_number,
        from = '4546',
        message,
        callback_url = ''
    }: {
        phone_number: string;
        message: string;
        from?: string;
        callback_url?: string
    }): Promise<ISendSmsResponse | void> {
        try {
            if (!this.token) {
                await this.getToken();
            }

            const data = new FormData();
            data.append("mobile_phone", phone_number);
            data.append("message", message);
            data.append("from", from);
            data.append('callback_url', callback_url);

            const response = await axios.post(`${this.baseUrl}/message/sms/send`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${this.token}`
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Eskiz SMS service error:", error?.response?.data || error.message);

            // If token expired (401), try to get a new one and retry once
            if (error?.response?.status === 401) {
                console.log("Token expired, retrying with new token...");
                await this.refreshToken();
                return await this.sendSms({ phone_number, from, message, callback_url });
            }

            throw error;
        };
    };
};


const smsService = new SmsService();

export default smsService;