module.exports = class MediaInfo {
    constructor(ct) {
        ct.mediaInfo = this;
        this.ct = ct;
    }
    async getImdbId(title, mediaType) {
        return this.ct.mediaInfoProvider.getImdbId(title, mediaType);
    }
    async getInfo(imdbId, mediaType) {
        const mediaInfo = await this.ct.mediaInfoProvider.getInfo(imdbId, mediaType);
        mediaInfo.subLangs = this.ct.mediaListing.getEntry(imdbId).subLangs;
        mediaInfo.subsStatus = await this.ct.subs.getStatus(imdbId);
        return mediaInfo;
    }
};