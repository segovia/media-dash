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

    getMediaListing(){
        return this.mediaListing;
    }

    async _updateInfoIfNeeded() {
        const sleepTime = 10000;
        let updated = false;
        while (await this._updateBatch(15)) {
            console.log(`\nWaiting ${sleepTime/1000}s to start next batch...\n`);
            await this._sleep(sleepTime);
            updated = true;
        }
        return updated;
    }

    async _updateBatch(batchSize) {
        const movies = this.mediaListing.children[0];
        const moviesWithoutId = movies.children.filter(movieFolder => movieFolder.imdbId == undefined || movieFolder == null);
        if (moviesWithoutId.length == 0) return false;
        const promises = moviesWithoutId.slice(0, batchSize).map(async (movieFolder) => {
            const imdbId = await this.ct.extMediaInfo.getMovieImdbId(movieFolder.name);
            console.log(`${movieFolder.name} -> ${imdbId}`);
            if (imdbId != null) {
                movieFolder.imdbId = imdbId;
            }
        });
        await Promise.all(promises);
        return moviesWithoutId.length > batchSize;
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};