const MEDIA_TYPE = require("./MediaType");
const Immutable = require("seamless-immutable");

const titleToImdbIdMapCacheKey = "imdb-ids.json";

module.exports = class MediaListing {
    constructor(ct) {
        ct.mediaListing = this;
        this.ct = ct;
    }

    async init() {
        try {
            const titleToImdbIdMap = await loadTitleToImdbIdMap(this.ct);
            const fileListing = await this.ct.fileListing.get();
            this.listing = await buildMediaListing(fileListing, titleToImdbIdMap);
            await requestAndFillInMissingImdbIds(this.ct, this.listing, titleToImdbIdMap);
        } catch (e) {
            console.log(e);
        }
    }

    get() {
        return this.listing;
    }

    getEntry(imdbId) {
        // not optimal runtime, imdbId to title could be precomputed if perfomance is bad
        const listingsVals = Object.values(this.listing);
        for (let i = 0; i < listingsVals.length; i++) {
            const found = Object.values(listingsVals[i].children).find((v) => {
                return v.imdbId === imdbId;
            });
            if (found) return found;
        }
        return "not found";
    }
};


const loadTitleToImdbIdMap = async (ct) => {
    return ct.cache.readOrLoadCache(
        titleToImdbIdMapCacheKey,
        () => ({ [MEDIA_TYPE.MOVIE]: {}, [MEDIA_TYPE.TV]: {} }));
};

const requestAndFillInMissingImdbIds = async (ct, mediaListing, imdbIds) => {
    const titlesMissingImdbId = getTitlesWithoutImdbId(mediaListing);
    if (titlesMissingImdbId.length === 0) return;
    // tmdb only allows 30 req per 10s, each imdb id needs 2 requests, so we can
    // only get 15 imdb ids per 10s.
    const batchSize = 15;
    const sleepTime = 10000;
    for (let i = 0; i < titlesMissingImdbId.length; i += batchSize) {
        console.log();
        let batch = titlesMissingImdbId.slice(i, i + batchSize);
        await updateBatch(ct, mediaListing, imdbIds, batch);
        if (batch.length === batchSize) {
            console.log(`\nWaiting ${sleepTime / 1000}s to start next batch...`);
            await sleep(sleepTime);
        }
    }
    console.log();
};

const updateBatch = async (ct, mediaListing, imdbIds, batch) => {
    const promises = batch.map(async (entry) => {
        const imdbId = await ct.extMediaInfo.getImdbId(entry.title, entry.type);
        console.log(`Media INFO: imdb id retrieved for ${entry.title} -> ${imdbId}`);
        if (imdbId != undefined) {
            mediaListing[entry.type].children[entry.title].imdbId = imdbId;
            imdbIds[entry.type][entry.title] = imdbId;
        }
    });
    await Promise.all(promises);
    await saveImdbIds(ct, imdbIds);
};

const buildMediaListing = async (fileListing, imdbIds) => {
    const mediaListing = Immutable.asMutable(fileListing, { deep: true });
    processSubtitleInfoForMovies(mediaListing);
    mergeMediaInfoByType(mediaListing, imdbIds, MEDIA_TYPE.MOVIE);
    mergeMediaInfoByType(mediaListing, imdbIds, MEDIA_TYPE.TV);
    return mediaListing;
};

const processSubtitleInfoForMovies = (mediaListing) => {
    const movies = mediaListing[MEDIA_TYPE.MOVIE].children;
    Object.entries(movies).forEach(([movieName, movieEntry]) => {
        movieEntry.subLangs = generateSubLangsString(movieName, movieEntry);
    });
};

const generateSubLangsString = (movieName, movieEntry) => {
    const subtitles = Object.keys(movieEntry.children).filter(filename =>
        filename.startsWith(`${movieName}.`) &&
        (filename.endsWith(".srt") || filename.endsWith(".sub")));

    return subtitles
        .map(filename => {
            const lang = filename.substr(-8, 4);
            return lang.charAt(0) === "." ? lang.substr(-3) : "default";
        })
        .sort((a, b) => orderIndex(a) - orderIndex(b))
        .filter((lang, idx, langs) => !idx || lang != langs[idx - 1]); // remove dups
};

const orderIndex = lang => {
    switch (lang) {
        case "default": return 0;
        case "eng": return 1;
        case "cze": return 2;
        case "ger": return 3;
    }
    return toNumber(lang);
};

const toNumber = (lang) => {
    let val = 0;
    let power = 1;
    let uCaseLang = lang.toUpperCase();
    let codeForA = "A".codePointAt(0);
    for (let i = 0; i < uCaseLang.length; i++ , power *= 26) {
        val += power * (uCaseLang.charCodeAt(uCaseLang.length - i - 1) - codeForA);
    }
    return val;
};

const mergeMediaInfoByType = (mediaListing, imdbIds, mediaType) => {
    const listing = mediaListing[mediaType].children;
    const imdbIdMap = imdbIds[mediaType];
    Object.keys(imdbIdMap).forEach(title => listing[title].imdbId = imdbIdMap[title]);
};

const getTitlesWithoutImdbId = (mediaListing) => {
    const fromMovies = getTitlesWithNoImdbId(mediaListing[MEDIA_TYPE.MOVIE].children);
    const fromTVShows = getTitlesWithNoImdbId(mediaListing[MEDIA_TYPE.TV].children);
    const result = fromMovies.map(t => ({ type: MEDIA_TYPE.MOVIE, title: t }));
    return result.concat(fromTVShows.map(t => ({ type: MEDIA_TYPE.TV, title: t })));
};

const getTitlesWithNoImdbId = (listing) => {
    return Object.keys(listing).filter(title => listing[title].imdbId === undefined);
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const saveImdbIds = async (ct, imdbIds) => {
    await ct.cache.persistCache(titleToImdbIdMapCacheKey, imdbIds);
};

