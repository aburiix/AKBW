class BaseError extends Error {
    status
    errors
    name
    statusCode

    constructor(status: any, message: any, errors = [], name: any, statusCode: any) {
        super(message)
        this.status = status
        this.errors = errors
        this.name = name
        this.statusCode = statusCode
    }

    static BadRequest(message: any, errors = []) {
        return new BaseError(400, message, errors, 'BadRequest', 400)
    }

    static Unauthorized() {
        return new BaseError(401, 'Unauthorized', [], 'Unauthorized', 401)
    }
}

export default BaseError;