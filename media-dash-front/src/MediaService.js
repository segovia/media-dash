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

const mediaListing = async () => {
    const response = await fetchThrow('/listing');
    return transformMediaListing(await response.json());
};

const transformMediaListing = (original) => {
    const newListing = { [MediaType.MOVIE]: [], [MediaType.TV]: [] };
    Object.entries(original).forEach(e => {
        e[1].id = e[0];
        getContainer(original, newListing, e[1]).push(e[1]);
    });

    return Immutable(newListing);
}

const getContainer = (original, newListing, entry) => {
    if (entry.type === MediaType.EPISODE || entry.type === MediaType.SEASON) {
        const parent = original[entry.parentId];
        if (!parent.children) parent.children = [];
        return parent.children;
    }
    return newListing[entry.type];
}

const mediaInfo = async (id, forceUpdate) => {
    return cacheInMemory(
        'mediaInfo',
        id,
        async () => (await fetchThrow(`/info/${id}`)).json(),
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

const clearCache = async () => fetchThrow('/clear-cache');

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

// const installSub = async (subId) => (await fetchThrow(`/subs/install/${subId}`)).text();
const tryAnotherSub = async (mediaId, lang) => (await fetchThrow(`/subs/${mediaId}/try-another/${lang}`)).text();
const resetTestedSub = async (mediaId, lang) => (await fetchThrow(`/subs/${mediaId}/reset-tested/${lang}`)).text();

export default { mediaListing, mediaInfo, movieSubs, tvShowSubs, tryAnotherSub, resetTestedSub, clearCache }