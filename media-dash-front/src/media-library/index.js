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
        MediaService.mediaListing().then(mediaListing => this.setState({
            navigation: this.state.navigation.set('mediaListing', mediaListing)
        }));
    }

    onTabSelect = (newActiveMediaType) => {
        this.setState({ navigation: this.state.navigation.set('activeMediaType', newActiveMediaType) });
    }

    onMediaEntryClick = async (mediaEntry) => {
        this.setState({
            navigation:
            this.state.navigation.set('activeMediaEntry', { id: mediaEntry.id, mediaType: mediaEntry.mediaType }),
            mediaInfo: mediaEntry
        });

        const promises = [];
        promises.push(MediaService.mediaInfo(mediaEntry.imdbId, mediaEntry.mediaType)
            .then(info => { this.setState({ mediaInfo: { ...this.state.mediaInfo, ...info } }) }));
        if (mediaEntry.mediaType === MediaType.MOVIE) {
            promises.push(MediaService.movieSubs(mediaEntry.imdbId, 'eng')
                .then(subs => {
                    // make sure that the subs received match the current entry
                    if (mediaEntry.imdbId !== this.state.mediaInfo.imdbId) return;
                    this.setState({
                        mediaInfo: { ...this.state.mediaInfo, subs }
                    })
                }));
        }
        return Promise.all(promises);
    }

    render() {
        if (!this.state.navigation.mediaListing) return <div className="MediaLibrary"><br /> Loading...</div>;
        return (
            <div className="MediaLibrary">
                <Navigation
                    navigation={this.state.navigation}
                    onTabSelect={this.onTabSelect}
                    onMediaEntryClick={this.onMediaEntryClick} />
                <ContentPanel mediaInfo={this.state.mediaInfo} />
            </div>
        );
    }
}