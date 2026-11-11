import BaseError from './base.errors.js';

class TransactionError extends BaseError {
    transactionErrorCode;
    transactionErrorMessage;
    transactionData;
    transactionId;
    isTransactionError;

    constructor(transactionError: any, id: any, data?: any) {
        super(500, transactionError?.message?.en || 'Transaction Error', [], 'TransactionError', 500)
        this.transactionErrorCode = transactionError?.code
        this.transactionErrorMessage = transactionError?.message
        this.transactionData = data
        this.transactionId = id
        this.isTransactionError = true
    }
};

export default TransactionError