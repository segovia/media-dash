module.exports = class Media {

    constructor(ct) {
        ct.media = this;
        this.ct = ct;
        this.cacheKey = "media";
    }

    async init() {
        this.mediaListing = await this.ct.cache.loadCache(this.cacheKey);
        let hasChanged = false;
        if (!this.mediaListing) {
            this.mediaListing = await this.ct.mediaFiles.getFileListing();
            hasChanged = true;
        }
        hasChanged = (await this._updateInfoIfNeeded()) || hasChanged;
        if (hasChanged) this.ct.cache.persistCache(this.cacheKey, this.mediaListing);
    }

    async _updateInfoIfNeeded() {
        const movies = this.mediaListing.children[0];
        let updated = false;
        const promises = movies.children.map(async (movieFolder) => {
            if (movieFolder.imdbId) {
                console.log(`${movieFolder.name} -> skipped!`);
                return;
            }
            const imdbId = await this.ct.extMediaInfo.getMovieImdbId(movieFolder.name);
            console.log(`${movieFolder.name} -> ${imdbId}`);
            if (imdbId) {
                movieFolder.imdbId = imdbId;
                updated = true;
            }
        });
        await Promise.all(promises);
        return updated;
    }
};