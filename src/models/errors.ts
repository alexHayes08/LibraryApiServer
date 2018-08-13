export class MessageError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

export class NotImplementedError extends MessageError {
    constructor() {
        super('Not yet implemented.');
    }
}

export class InvalidCastError extends MessageError {
    constructor() {
        super('Failed to cast object.');
    }
}

export class InternalError extends MessageError {
    constructor(error?: string) {
        super(error !== undefined
            ? error.toString()
            : 'An internal error occurred.');
    }
}

export class AlreadyLockedError extends MessageError {
    constructor() {
        super('Lockable was already locked.');
    }
}