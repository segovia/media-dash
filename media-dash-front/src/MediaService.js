import MediaType from './MediaType';
import Immutable from 'seamless-immutable'

const inMemoryCache = {};

async function mediaListing() {
    const response = await fetch('/media-listing');
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
        active: false
    }));
}

function removeYearFromTitle(title) {
    return title.slice(0, title.length - 7);
}

const mediaInfo = async (imdbId, mediaType) => {
    return cacheInMemory('mediaInfo', imdbId,
        async () => (await fetch(`/${mediaType === MediaType.TV ? 'tv' : 'movie'}/${imdbId}`)).json());
};

const movieSubs = async (imdbId, language) => {
    return cacheInMemory('movieSubs', [imdbId, language],
        async () => await fetchSubs(`/movie/${imdbId}/subs/${language}`));
};

const tvShowSubs = async (imdbId, season, episode, language) => {
    return cacheInMemory('tvShowSubs', [imdbId, season, episode, language],
        async () => await fetchSubs(`/tv/${imdbId}/${season}/${episode}/subs/${language}`));
};

const fetchSubs = async (url) =>  (await fetch(url)).json();

const cacheInMemory = async (cacheName, key, update) => {
    let cache = inMemoryCache[cacheName];
    if (!cache) {
        cache = {};
        inMemoryCache[cacheName] = cache;
    }
    let value = cache[key];
    if (!value) {
        value = await update();
        cache[key] = value;
    }
    return value;
}

export default { mediaListing, mediaInfo, movieSubs, tvShowSubs }