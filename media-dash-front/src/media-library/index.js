import React, { Component } from 'react';
import Immutable from 'seamless-immutable'
import ContentPanel from './ContentPanel';
import Navigation from './Navigation';
import './index.css'
import MediaService from '../MediaService';
import MediaType from '../MediaType';
export default class MediaLibrary extends Component {

    constructor(props) {
        super(props)
        this.state = Immutable({ navigation: { activeMediaType: MediaType.MOVIE } });
    }

    componentWillMount = () => {
        this.refreshMediaListing();
    }

    refreshMediaListing = async () => {
        return MediaService.mediaListing().then(mediaListing => this.setState({
            navigation: this.state.navigation.set('mediaListing', mediaListing)
        }));
    }

    onTabSelect = (newActiveMediaType) => {
        this.setState({ navigation: this.state.navigation.set('activeMediaType', newActiveMediaType) });
    }

    onMediaEntryClick = async (mediaEntry) => {
        this.setState({
            navigation:
            this.state.navigation.set('activeMediaEntry', {
                id: mediaEntry.id,
                mediaType: mediaEntry.mediaType
            }),
            mediaInfo: Immutable(mediaEntry)
        });

        return this.loadMediaInfo(mediaEntry.imdbId, mediaEntry.mediaType);
    }

    loadMediaInfo(imdbId, mediaType, forceUpdate) {
        MediaService.mediaInfo(imdbId, mediaType, forceUpdate)
            .then(info => { this.setState({ mediaInfo: this.state.mediaInfo.merge(info) }) });
        if (mediaType === MediaType.MOVIE) {
            MediaService.movieSubs(imdbId, 'eng')
                .then(subs => {
                    // make sure that the subs received match the current entry
                    if (imdbId !== this.state.mediaInfo.imdbId) return;
                    this.setState({ mediaInfo: this.state.mediaInfo.set('subs', subs) });
                })
                .catch(e => {
                    console.log(e.stack);
                    this.setState({ mediaInfo: this.state.mediaInfo.set('subsError', e.stack) });
                });
        }
    }

    onInstallSub = async (subId) => {
        await MediaService.installSub(subId);
        this.refresh();
    }

    refresh() {
        this.refreshMediaListing();
        if (this.state.mediaInfo && this.state.mediaInfo.imdbId) {
            this.loadMediaInfo(this.state.mediaInfo.imdbId, this.state.mediaInfo.mediaType, true);
        }
    }

    render() {
        if (!this.state.navigation.mediaListing) return <div className="MediaLibrary"><br /> Loading...</div>;
        return (
            <div className="MediaLibrary">
                <Navigation
                    navigation={this.state.navigation}
                    onTabSelect={this.onTabSelect}
                    onMediaEntryClick={this.onMediaEntryClick} />
                <ContentPanel mediaInfo={this.state.mediaInfo} onInstallSub={this.onInstallSub} />
            </div>
        );
    }
}