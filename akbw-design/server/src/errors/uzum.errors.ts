export class UzumBaseError extends Error {
    status: number
    errors: any[]
    name: string
    statusCode: number

    constructor(status: number, message: any, errors = [], name?: string, statusCode?: number) {
        super(message)
        this.status = status
        this.errors = errors
        this.name = String(name);
        this.statusCode = Number(statusCode)
    }

    static BadRequest(message: any, errors = []) {
        return new UzumBaseError(400, message, errors)
    }

    static Unauthorized() {
        return new UzumBaseError(401, 'Unauthorized')
    }
}