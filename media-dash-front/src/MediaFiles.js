import React, { Component } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem, Panel, Tabs, Tab, Jumbotron } from 'react-bootstrap';
import MediaService from './MediaService';
import MediaType from './MediaType';
import './MediaFiles.css'

export default class MediaFiles extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mediaListing: {},
        };
        MediaService.mediaListing()
            .then(mediaListing => this.setState({ mediaListing }));
    }

    _renderMediaType(mediaType) {
        const parentFolder = this.state.mediaListing[mediaType]
        if (parentFolder) {
            return (
                <ListGroup className="MediaFiles-fileList">
                    {Object.keys(parentFolder.children).map((title) =>
                        <ListGroupItem
                            onClick={() => {
                                this.setState({ active: title});
                                MediaService.mediaInfo(parentFolder.children[title].imdbId, mediaType)
                                    .then((result) => this.setState({ activeContent: result }));
                            }}
                            key={title}
                            className="MediaFiles-listItem"
                            active={this.state.active === title}
                        >
                            <span>{mediaType === MediaType.TV ? title : this._removeYearFromTitle(title)}</span>
                            <span className="MediaFiles-imdbId">{parentFolder.children[title].imdbId}</span>
                        </ListGroupItem>
                    )}
                </ListGroup>
            );
        }
        return (
            <span>loading</span>
        );
    }

    _removeYearFromTitle(title) {
        return title.slice(0, title.length - 7);
    }

    _renderInfoPanel() {
        if (this.state.activeContent) {
            const info = this.state.activeContent;
            const style = { backgroundImage: `url(http://image.tmdb.org/t/p/w1280/${info.backdropPath})` };
            const poster = <img alt="" src={`http://image.tmdb.org/t/p/w185/${info.posterPath}`} />;

            return (
                <div className="MediaFiles-content" style={style} >
                    <h3>{info.title}</h3>
                    <div className="MediaFiles-poster">
                        {poster}
                    </div>
                    {info.overview}
                </div>
            );
        }
        return <div className="MediaFiles-content" ></div>

    }

    render() {
        return (
            <div className="MediaFiles-container">
                <div className="MediaFiles-navigation">
                    <Tabs id="media-files-type-selection">
                        <Tab eventKey={1} title={MediaType.MOVIE}>
                            {this._renderMediaType(MediaType.MOVIE)}
                        </Tab>
                        <Tab eventKey={2} title={MediaType.TV}>
                            {this._renderMediaType(MediaType.TV)}
                        </Tab>
                    </Tabs>
                </div>
                {this._renderInfoPanel()}
            </div>
        );
    }
}