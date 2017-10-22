import MediaService from "./MediaService";

export const selectTab = tabKey => ({
    type: 'SELECT_TAB',
    tabKey
});

export const selectMediaEntry = (mediaId) => {
    return dispatch => {
        dispatch({ type: 'SELECT_MEDIA_ENTRY', mediaId });
        return dispatch(requestMediaInfo(mediaId, false));
    };
};

export const requestMediaInfo = (mediaId, forceUpdate) => {
    return dispatch => {
        dispatch({ type: 'REQUEST_MEDIA_INFO', mediaId });
        return MediaService.mediaInfo(mediaId, forceUpdate)
            .then(info => dispatch(receiveMediaInfoSuccess(info)))
            .catch(error => dispatch(receiveMediaInfoFailure(mediaId, error)))
            .then(info => dispatch(receiveMediaInfoFinally(mediaId)));
    };
};

export const receiveMediaInfoSuccess = mediaInfo => ({
    type: 'RECEIVE_MEDIA_INFO_SUCCESS',
    mediaInfo
});

export const receiveMediaInfoFailure = (mediaId, error) => ({
    type: 'RECEIVE_MEDIA_INFO_FAILURE',
    mediaId,
    error
});

export const receiveMediaInfoFinally = mediaId => ({
    type: 'RECEIVE_MEDIA_INFO_FINALLY',
    mediaId
});

export const requestMediaListing = () => {
    return dispatch => {
        dispatch({ type: 'REQUEST_MEDIA_LISTING' });
        return MediaService.mediaListing().then(mediaListing => dispatch(receiveMediaListing(mediaListing)));
    };
};

export const receiveMediaListing = mediaListing => ({
    type: 'RECEIVE_MEDIA_LISTING',
    mediaListing
});

export const tryAnotherSub = (mediaId, lang) => {
    return requestSub((...args) => MediaService.tryAnotherSub(...args), mediaId, lang);
};

export const resetTestedSub = (mediaId, lang) => {
    return requestSub((...args) => MediaService.resetTestedSub(...args), mediaId, lang);
};

const requestSub = (requester, mediaId, lang) => {
    return dispatch => {
        dispatch({ type: 'REQUEST_SUB', mediaId, lang });
        return requester(mediaId, lang)
            .catch(error => dispatch({ type: 'RECEIVE_SUB_FAILURE', mediaId, error }))
            .then(() => dispatch(refreshMedia(mediaId)))
            .then(e => dispatch({ type: 'RECEIVE_SUB_FINALLY', mediaId }));
    };
};

const refreshMedia = (mediaId) => {
    return dispatch => {
        return dispatch(requestMediaListing())
            .then(() => dispatch(requestMediaInfo(mediaId, true)));
    };
};