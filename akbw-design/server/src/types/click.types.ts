interface ClickPrapere {
    click_trans_id: bigint, 
    service_id: number,
    click_paydoc_id: bigint,
    merchant_trans_id: string,
    amount: number,
    action: number,
    error: number,
    error_note: string,
    sign_time: string,
    sign_string: string,
};

interface ClickComplete { click_trans_id: bigint, 
    service_id: number, merchant_trans_id: number, merchant_prepare_id: number, amount: number, action: number, sign_time:string, sign_string: string, error: number }

interface CheckSignatureToken {
    click_trans_id: bigint,
    service_id: number,
    order_id: number,
    amount: number,
    action: number,
    sign_time: string,
    merchant_prepare_id?: bigint
};


export type {
    ClickPrapere,
    CheckSignatureToken,
    ClickComplete,
};