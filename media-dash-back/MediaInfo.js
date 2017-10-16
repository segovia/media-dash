const without = require("seamless-immutable").without;

module.exports = class MediaInfo {
    constructor(ct) {
        ct.mediaInfo = this;
        this.ct = ct;
    }
    async getInfo(id) {
        const info = await this.ct.mediaInfoProvider.getInfo(id);
        if (!info) throw Error("Info not found");
        info.subsStatus = await this.ct.subs.getStatus(id);
        return info;
    }

    async getImdbId(id) {
        return this.ct.mediaInfoProvider.getImdbId(id);
    }

    async getInfoFiltered(id) {
        return without(await this.getInfo(id), ["tmdbId", "imdbId"]);
    }
};