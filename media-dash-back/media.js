const MEDIA_TYPE = require("./media_type");
const deepAssign = require("deep-assign");

module.exports = class Media {

    constructor(ct) {
        ct.media = this;
        this.ct = ct;
        this.fileListingCacheKey = "file-listing.json";
        this.imdbIdsCacheKey = "imdb-ids.json";
    }

    async init() {
        try {
            await Promise.all([this._loadFileListing(), this._loadImdbIds()]);
            this._mergeMediaInfo();
            await this._requestMissingImdbIds();
        } catch (e) {
            console.log(e);
        }
    }

    getMediaListing() {
        return this.mediaListing;
    }

    async _loadFileListing() {
        this.fileListing = await this.ct.cache.readOrLoadCache(
            this.fileListingCacheKey,
            async () => await this.ct.mediaFiles.getFileListing());
    }

    async _loadImdbIds() {
        this.imdbIds = await this.ct.cache.readOrLoadCache(
            this.imdbIdsCacheKey,
            () => ({ [MEDIA_TYPE.MOVIE]: {}, [MEDIA_TYPE.TV]: {} }));
    }

    _mergeMediaInfo() {
        this._mergeMediaInfoByType(MEDIA_TYPE.MOVIE);
        this._mergeMediaInfoByType(MEDIA_TYPE.TV);
    }

    _mergeMediaInfoByType(mediaType) {
        this.mediaListing = deepAssign(this.fileListing);
        const listing = this.mediaListing[mediaType].children;
        const imdbIdMap = this.imdbIds[mediaType];
        Object.keys(imdbIdMap).forEach(title => listing[title].imdbId = imdbIdMap[title]);
    }

    async _requestMissingImdbIds() {
        const titlesMissingImdbId = this._getTitlesWithoutImdbId();
        if (titlesMissingImdbId.length === 0) return;
        // tmdb only allows 40 req per 20s, each imdb id needs 2 requests, so we can
        // only get 15 imdb ids per 10s.
        const batchSize = 15;
        const sleepTime = 10000; 
        for (let i = 0; i < titlesMissingImdbId.length; i += batchSize) {
            console.log();
            let batch = titlesMissingImdbId.slice(i, i + batchSize);
            await this._updateBatch(batch);
            if (batch.length === batchSize) {
                console.log(`\nWaiting ${sleepTime / 1000}s to start next batch...`);
                await this._sleep(sleepTime);
            }
        }
        console.log();
    }

    async _updateBatch(batch) {
        const promises = batch.map(async (entry) => {
            const imdbId = await this.ct.extMediaInfo.getImdbId(entry.title, entry.type);
            console.log(`Media INFO: imdb id retrieved for ${entry.title} -> ${imdbId}`);
            if (imdbId != undefined) {
                this.mediaListing[entry.type].children[entry.title].imdbId = imdbId;
                this.imdbIds[entry.type][entry.title] = imdbId;
            }
        });
        await Promise.all(promises);
        await this._saveImdbIds();
    }

    _getTitlesWithoutImdbId() {
        const fromMovies = this._getTitlesWithNoImdbId(this.mediaListing[MEDIA_TYPE.MOVIE].children);
        const fromTVShows = this._getTitlesWithNoImdbId(this.mediaListing[MEDIA_TYPE.TV].children);
        const result = fromMovies.map(t => ({ type: MEDIA_TYPE.MOVIE, title: t }));
        return result.concat(fromTVShows.map(t => ({ type: MEDIA_TYPE.TV, title: t })));
    }

    _getTitlesWithNoImdbId(listing) {
        return Object.keys(listing).filter(title => listing[title].imdbId === undefined);
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _saveImdbIds() {
        await this.ct.cache.persistCache(this.imdbIdsCacheKey, this.imdbIds);
    }


};