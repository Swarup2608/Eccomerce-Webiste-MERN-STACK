export class AppError extends Error {
    constructor(public statusCode: number, message: string, public isOperational: boolean = true) {

        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}