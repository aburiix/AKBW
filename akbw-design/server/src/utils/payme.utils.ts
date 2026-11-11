import {
    TransactionState
} from "../generated/prisma/client/index.js";


export const enumToNumeric = (state: TransactionState) => {
    switch (state) {
        case TransactionState.PENDING:
            return 1;
        case TransactionState.PAID:
            return 2;
        case TransactionState.PENDING_CANCELLED:
            return -1;
        case TransactionState.PAID_CANCELLED:
            return -2;
        default:
            return 1;
    };
};