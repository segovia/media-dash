import MediaType from './MediaType';


async function mediaListing() {
    const response = await fetch('/media-listing');
    return transformMediaListing(await response.json());
};

function transformMediaListing(original) {
    return {
        [MediaType.MOVIE]: transformMediaListingForType(original, MediaType.MOVIE),
        [MediaType.TV]: transformMediaListingForType(original, MediaType.TV)
    }
}

function transformMediaListingForType(mediaListing, mediaType) {
    const folder = mediaListing[mediaType].children;
    return Object.keys(folder).map((title) => ({
        id: title,
        title: (mediaType === MediaType.TV ? title : removeYearFromTitle(title)),
        imdbId: folder[title].imdbId,
        mediaType: mediaType
    }));
}

function removeYearFromTitle(title) {
    return title.slice(0, title.length - 7);
}

const mediaInfo = async (imdbId, mediaType) => {
    const json = await (await fetch(`/${mediaType === MediaType.TV ? 'tv' : 'movie'}/${imdbId}`)).json();
    json.tmdbId = json.id;
    delete json.id;
    return json;
};


export default { mediaListing, mediaInfo }