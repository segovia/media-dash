import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './ContentPanel.css';
import MediaType from '../MediaType';
import { Alert, Glyphicon } from 'react-bootstrap';
import LoadingSpinner from '../LoadingSpinner';
import MovieContent from './content/MovieContent';
import TVShowContent from './content/TVShowContent';
import SeasonContent from './content/SeasonContent';
import EpisodeContent from './content/EpisodeContent';


export default class ContentPanel extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.object,
        error: PropTypes.string,
        onTryAnotherSub: PropTypes.func,
        onResetTestedSub: PropTypes.func
    };

    handleTryAnotherSub = (lang) => this.props.onTryAnotherSub(this.props.mediaInfo.id, lang);
    handleResetTestedSub = (lang) => this.props.onResetTestedSub(this.props.mediaInfo.id, lang);

    render() {
        const className = "MediaLibrary-ContentPanel";
        if (!this.props.mediaInfo) return <div className={className} ></div>;
        if (this.props.mediaInfo.type === MediaType.NOT_FOUND) return (
            <div className={className} >
                <Alert bsStyle="danger">
                    <strong><Glyphicon glyph="exclamation-sign" /> There was a problem loading media info:</strong>
                    <pre>{this.props.mediaInfo.error}</pre>
                </Alert>
            </div>);
        if (!this.props.mediaInfo.posterPath && !this.props.mediaInfo.stillPath) return <div className={className} ><LoadingSpinner /></div>;
        return (
            <div className={className}>
                {renderContent(this.props.mediaInfo, this.handleTryAnotherSub, this.handleResetTestedSub)}
            </div>
        );
    }
};

const renderContent = (mediaInfo, onTryAnotherSub, onResetTestedSub) => {
    switch (mediaInfo.type) {
        case MediaType.MOVIE:
            return <MovieContent mediaInfo={mediaInfo} onTryAnotherSub={onTryAnotherSub} onResetTestedSub={onResetTestedSub} />;
        case MediaType.TV:
            return <TVShowContent mediaInfo={mediaInfo} />;
        case MediaType.SEASON:
            return <SeasonContent mediaInfo={mediaInfo} />;
        case MediaType.EPISODE:
            return <EpisodeContent mediaInfo={mediaInfo} onTryAnotherSub={onTryAnotherSub} onResetTestedSub={onResetTestedSub} />;
        default:
            return <span>Unhandled media type</span>;
    }
}