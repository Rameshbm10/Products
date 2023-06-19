class CustomErrorHandler extends Error {
    constructor(status, msg) {
        this.status = status;
        this.msg = msg;
    }

    static customeError(status, msg) {
        return new CustomErrorHandler(status, msg);
    }
}

module.exports = CustomErrorHandler;