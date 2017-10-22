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
    const mediaListing = await (await fetchThrow('/listing')).json();
    addChildrenFields(mediaListing);
    return mediaListing;
};

const addChildrenFields = (mediaListing) => {
    Object.entries(mediaListing).forEach(e => {
        e[1].id = e[0];
        addToParent(mediaListing, e[1]);
    });
}

const addToParent = (mediaListing, entry) => {
    if (!entry.parentId) return;
    const parent = mediaListing[entry.parentId];
    if (!parent.children) parent.children = [];
    parent.children.push(entry.id);
}

const mediaInfo = async (id, forceUpdate) => {
    return cacheInMemory(
        'mediaInfo',
        id,
        () => fetchThrow(`/info/${id}`)
            .then(r => r.json())
            .then(o => Object.assign(o, { id })),
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