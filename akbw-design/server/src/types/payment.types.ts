export interface RpcRequest {
    jsonrpc: string;
    method: string;
    id: number;
    params: any;
}

export interface PaynetRpcResponse {
    jsonrpc: "2.0";
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number;
}

export interface PaynetParams {
    transactionId?: number | string;
    /** Present on CheckTransaction / CancelTransaction requests from Paynet, not on PerformTransaction */
    timestamp?: string;
    amount?: number;
    serviceId?: number;
    fields?: {
        client_id?: string;
        order_id?: string;
        [key: string]: unknown;
    };
}

export interface GetStatementParams {
    serviceId: string;
    dateFrom: string;
    dateTo: string;
}