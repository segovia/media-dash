module.exports = class Subs {
    constructor(ct) {
        ct.subs = this;
        this.ct = ct;
    }
};