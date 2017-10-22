import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './ContentPanel.css';
import MediaType from '../MediaType';
import { Alert, Glyphicon } from 'react-bootstrap';
import LoadingSpinner from '../LoadingSpinner';
import MovieContent from './content/MovieContent';
import TVShowContent from './content/TVShowContent';
import SeasonContent from './content/SeasonContent';
import EpisodeContent from './content/EpisodeContent';

class ContentPanel extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.object
    };

    render() {
        const mediaInfo = this.props.mediaInfo;
        const className = "MediaLibrary-ContentPanel";
        if (!mediaInfo) return <div className={className} ></div>;
        if (mediaInfo.type === MediaType.NOT_FOUND) return (
            <div className={className} >
                <Alert bsStyle="danger">
                    <strong><Glyphicon glyph="exclamation-sign" /> There was a problem loading media info:</strong>
                    <pre>{mediaInfo.error}</pre>
                </Alert>
            </div>);
        if (mediaInfo.loading) return <div className={className} ><LoadingSpinner /></div>;
        return (
            <div className={className}>
                {renderContent(mediaInfo)}
            </div>
        );
    }
};

const renderContent = (mediaInfo) => {
    switch (mediaInfo.type) {
        case MediaType.MOVIE:
            return <MovieContent mediaInfo={mediaInfo}/>;
        case MediaType.TV:
            return <TVShowContent mediaInfo={mediaInfo} />;
        case MediaType.SEASON:
            return <SeasonContent mediaInfo={mediaInfo} />;
        case MediaType.EPISODE:
            return <EpisodeContent mediaInfo={mediaInfo}/>;
        default:
            return <span>Unhandled media type</span>;
    }
}

const mapStateToProps = state => {
    return {
        mediaInfo: state.mediaLibrary.mediaInfo
    }
};

export default connect(mapStateToProps, () => ({}))(ContentPanel);