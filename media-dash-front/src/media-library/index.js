import React, { Component } from 'react';
import Immutable from 'seamless-immutable'
import ContentPanel from './ContentPanel';
import Navigation from './Navigation';
import './index.css'
import LoadingSpinner from '../LoadingSpinner';
import MediaService from '../MediaService';
import MediaType from '../MediaType';

export default class MediaLibrary extends Component {

    constructor(props) {
        super(props)
        this.state = Immutable({ navigation: { activeMediaType: MediaType.MOVIE, openEntries: [] } });
    }

    componentWillMount = () => {
        this.refreshMediaListing();
    }

    refreshMediaListing = async () => {
        return MediaService.mediaListing().then(mediaListing => {
            let newNavigation = this.state.navigation.set('mediaListing', mediaListing);
            if (this.state.navigation.activeMediaEntry) {
                let newActiveMediaEntry = findMediaEntryInListing(mediaListing, this.state.navigation.activeMediaEntry.id);
                newNavigation = this.state.navigation.set('activeMediaEntry', newActiveMediaEntry);
            }
            this.setState({ navigation: newNavigation });
            if (this.state.mediaInfo && this.state.mediaInfo.id) {
                let newMediaEntry = findMediaEntryInListing(mediaListing, this.state.mediaInfo.id);
                this.setState({
                    mediaInfo: this.state.mediaInfo.merge(newMediaEntry)
                });
            }
        });
    }

    onTabSelect = (newActiveMediaType) => {
        this.setState({ navigation: this.state.navigation.set('activeMediaType', newActiveMediaType) });
    }

    onMediaEntryClick = async (mediaEntry) => {
        const newNavigation = this.state.navigation.set('activeMediaEntry', mediaEntry);
        this.setState({
            navigation: newNavigation,
            mediaInfo: Immutable(mediaEntry)
        });

        if (mediaEntry.children) {
            const openEntries = newNavigation.openEntries;
            const newOpenEntries = openEntries.includes(mediaEntry.id) ?
                openEntries.filter(id => id !== mediaEntry.id) :
                openEntries.concat(mediaEntry.id);

            this.setState({ navigation: newNavigation.set('openEntries', newOpenEntries) });
        }

        return this.loadMediaInfo(mediaEntry.id);
    }

    loadMediaInfo(mediaId, forceUpdate) {
        MediaService.mediaInfo(mediaId, forceUpdate)
            .then(info => { this.setState({ mediaInfo: this.state.mediaInfo.merge(info) }) })
            .catch(error => { this.setState({ mediaInfo: { type: MediaType.NOT_FOUND, error: error.stack } }) });
    }

    onTryAnotherSub = async (mediaId, lang) => {
        try {
            this.setState({ mediaInfo: this.state.mediaInfo.merge({ subsError: "", subsLoading: true }) });
            await MediaService.tryAnotherSub(mediaId, lang);
        } catch (e) {
            this.setState({ mediaInfo: this.state.mediaInfo.merge({ subsError: e.stack }) });
        }
        await this.refresh(mediaId);
        this.setState({ mediaInfo: this.state.mediaInfo.merge({ subsLoading: false }) });
    }

    onResetTestedSub = async (mediaId, lang) => {
        try {
            this.setState({ mediaInfo: this.state.mediaInfo.merge({ subsError: "", subsLoading: true }) });
            await MediaService.resetTestedSub(mediaId, lang);
        } catch (e) {
            this.setState({ mediaInfo: this.state.mediaInfo.merge({ subsError: e.stack }) });
        }
        await this.refresh(mediaId);
        this.setState({ mediaInfo: this.state.mediaInfo.merge({ subsLoading: false }) });
    }

    async refresh(mediaId) {
        await this.refreshMediaListing();
        if (mediaId) await this.loadMediaInfo(mediaId, true);
    }

    render() {
        if (!this.state.navigation.mediaListing) return <div className="MediaLibrary"><LoadingSpinner /></div>;
        return (
            <div className="MediaLibrary">
                <Navigation
                    navigation={this.state.navigation}
                    onTabSelect={this.onTabSelect}
                    onMediaEntryClick={this.onMediaEntryClick} />
                <ContentPanel
                    mediaInfo={this.state.mediaInfo}
                    onTryAnotherSub={this.onTryAnotherSub}
                    onResetTestedSub={this.onResetTestedSub} />
            </div>
        );
    }
}

const findMediaEntryInListing = (listing, id) => {
    let entry;
    const mediaTypes = Object.keys(listing);
    for (let type of mediaTypes) {
        entry = findMediaEntryInListingDFS(listing[type], id);
        if (entry) break;
    }
    return entry;
}

const findMediaEntryInListingDFS = (listing, id) => {
    for (let entry of listing) {
        if (entry.id === id) return entry;
        if (!entry.children) continue;
        const result = findMediaEntryInListingDFS(entry.children, id);
        if (result) return result;
    }
    return null;
}