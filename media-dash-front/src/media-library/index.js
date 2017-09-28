import React, { Component } from 'react';
import MediaService from '../MediaService';
import ContentPanel from './ContentPanel';
import Navigation from './Navigation';
import './index.css'
export default class MediaLibrary extends Component {

    constructor(props) {
        super(props)
        this.state = {};
    }

    componentWillMount = () => {
        MediaService.mediaListing().then(mediaListing => this.setState({ mediaListing }));
    }

    onTabSelect = (eventKey) => {
        this.setState({ activeMediaType: eventKey });
    }

    onMediaEntryClick = async (mediaEntry) => {
        this.setState({ activeMediaEntry: mediaEntry });
        if (!mediaEntry.posterPath) {
            const info = await MediaService.mediaInfo(mediaEntry.imdbId, mediaEntry.mediaType);
            this.setState({ activeMediaEntry: Object.assign(mediaEntry, info) });
        }
    }

    render() {
        if (!this.state.mediaListing) return <div className="MediaLibrary">Loading...</div>;
        return (
            <div className="MediaLibrary">
                <Navigation
                    {...this.state}
                    onTabSelect={this.onTabSelect}
                    onMediaEntryClick={this.onMediaEntryClick} />
                <ContentPanel mediaEntry={this.state.activeMediaEntry} />
            </div>
        );
    }
}