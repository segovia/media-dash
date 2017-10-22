import MediaType from './MediaType';
import { combineReducers } from 'redux'

/* eslint-disable default-case*/
const activeMediaType = (state = MediaType.MOVIE, action) => {
    switch (action.type) {
        case 'SELECT_TAB':
            return action.tabKey;
    }
    return state;
};

const activeMediaId = (state = null, action) => {
    switch (action.type) {
        case 'SELECT_MEDIA_ENTRY':
            return action.mediaId;
    }
    return state;
};

const mediaListing = (state = null, action) => {
    switch (action.type) {
        case 'RECEIVE_MEDIA_LISTING':
            return action.mediaListing;
    }
    return state;
};

const mediaInfo = (state = null, action, mediaListing) => {
    switch (action.type) {
        case 'REQUEST_MEDIA_INFO':
            if (!state || state.id !== action.mediaId) {
                return Object.assign({}, { id: action.mediaId, type: mediaListing[action.mediaId].type, loading: true });
            }
            break;
        case 'RECEIVE_MEDIA_INFO_SUCCESS':
            if (state.id === action.mediaInfo.id) {
                return Object.assign({}, state, action.mediaInfo, { loading: false });
            }
            break;
        case 'RECEIVE_MEDIA_INFO_FAILURE':
            return { type: MediaType.NOT_FOUND, error: action.error.stack };
        case 'REQUEST_SUB':
            if (state.id === action.mediaId) {
                return Object.assign({}, state, { subsLoading: true, subsError: '' });
            }
            break;
        case 'RECEIVE_SUB_FAILURE':
            if (state.id === action.mediaId) {
                return Object.assign({}, state, { subsError: action.subsError });
            }
            break;
        case 'RECEIVE_SUB_FINALLY':
            if (state.id === action.mediaId) {
                return Object.assign({}, state, { subsLoading: false });
            }
            break;
    }
    return state;
};

const openEntries = (state = [], { type, mediaId }, mediaListing) => {
    if (type !== 'SELECT_MEDIA_ENTRY') return state;
    if (!mediaListing[mediaId].children) return state;
    return state.includes(mediaId) ?
        state.filter(id => id !== mediaId) :
        state.concat(mediaId);
};

const mediaLibrary = (state = {}, action) => ({
    mediaListing: mediaListing(state.mediaListing, action),
    activeMediaId: activeMediaId(state.activeMediaId, action),
    activeMediaType: activeMediaType(state.activeMediaType, action),
    mediaInfo: mediaInfo(state.mediaInfo, action, state.mediaListing),
    openEntries: openEntries(state.openEntries, action, state.mediaListing)
});

const appReducers = combineReducers({
    mediaLibrary
});

export default appReducers;
