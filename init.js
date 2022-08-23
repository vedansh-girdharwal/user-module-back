class HttpError extends Error{
    constructor(message, status){
        super(message);
        this.status = status || 500;
    }
}

global.HttpError = HttpError;