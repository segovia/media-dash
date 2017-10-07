import MediaType from './MediaType';
import Immutable from 'seamless-immutable'

const inMemoryCache = {};

const fetchThrow = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new FetchError(response.statusText, await response.text());
    return response;
}

class FetchError extends Error {
    constructor(statusText, body) {
        super(`${statusText}\n\nStack on server:\n  ${body}\n\nStack on browser:`);
        this.name = 'FetchError';
    }
}

async function mediaListing() {
    const response = await fetchThrow('/media-listing');
    return transformMediaListing(await response.json());
};

function transformMediaListing(original) {
    return Immutable({
        [MediaType.MOVIE]: transformMediaListingForType(original, MediaType.MOVIE),
        [MediaType.TV]: transformMediaListingForType(original, MediaType.TV)
    });
}

function transformMediaListingForType(mediaListing, mediaType) {
    const folder = mediaListing[mediaType].children;
    return Object.keys(folder).map((fileName, index) => ({
        id: fileName,
        title: (mediaType === MediaType.TV ? fileName : removeYearFromTitle(fileName)),
        imdbId: folder[fileName].imdbId,
        mediaType,
        subLangs: folder[fileName].subLangs,
        active: false
    }));
}

function removeYearFromTitle(title) {
    return title.slice(0, title.length - 7);
}

const mediaInfo = async (imdbId, mediaType, forceUpdate) => {
    return cacheInMemory(
        'mediaInfo',
        imdbId,
        async () => (await fetchThrow(`/${mediaType === MediaType.TV ? 'tv' : 'movie'}/${imdbId}`)).json(),
        forceUpdate);
};

const movieSubs = async (imdbId, language) => {
    return cacheInMemory('movieSubs', [imdbId, language],
        async () => await fetchSubs(`/movie/${imdbId}/subs/${language}`));
};

const tvShowSubs = async (imdbId, season, episode, language) => {
    return cacheInMemory('tvShowSubs', [imdbId, season, episode, language],
        async () => await fetchSubs(`/tv/${imdbId}/${season}/${episode}/subs/${language}`));
};

const fetchSubs = async (url) => (await fetchThrow(url)).json();

const cacheInMemory = async (cacheName, key, update, forceUpdate) => {
    let cache = inMemoryCache[cacheName];
    if (!cache) {
        cache = {};
        inMemoryCache[cacheName] = cache;
    }
    let value = cache[key];
    if (forceUpdate || !value) {
        value = await update();
        cache[key] = value;
    }
    return value;
}

const installSub = async (subId) => (await fetchThrow(`/subs/install/${subId}`)).text();

export default { mediaListing, mediaInfo, movieSubs, tvShowSubs, installSub }