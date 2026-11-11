import type {
    CheckSignatureToken
} from "../types/click.types.js";
import md5 from "md5";

export const checkSignatureToken = (sign_string: string, { click_trans_id,
    service_id,
    merchant_prepare_id,
    amount,
    action,
    order_id,
    sign_time }: CheckSignatureToken): boolean => {
    const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY
    if (!CLICK_SECRET_KEY) {
        throw new Error("Secret key is missing", { cause: "Sercet Key Not Found" });
    };
    const prepareId = merchant_prepare_id || ''
    const signature = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${order_id}${prepareId}${amount}${action}${sign_time}`
    const signatureHash = md5(signature);
    return signatureHash === sign_string;
};