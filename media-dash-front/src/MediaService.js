import MediaType from './MediaType';

const mediaListing = async () => {
    const response = await fetch('/media-listing');
    return response.json();
};

const mediaInfo = async (imdbId, mediaType) => {
    return await (await fetch(`/${mediaType === MediaType.TV ? 'tv' : 'movie'}/${imdbId}`)).json();
};


export default { mediaListing, mediaInfo }