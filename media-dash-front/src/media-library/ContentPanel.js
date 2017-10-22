import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './ContentPanel.css';
import MediaType from '../MediaType';
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
        return (
            <div className="MediaLibrary-ContentPanel">
                {mediaInfo && (mediaInfo.loading ? <LoadingSpinner /> : renderContent(mediaInfo))}
            </div>
        );
    }
};

const renderContent = (mediaInfo) => {
    switch (mediaInfo.type) {
        case MediaType.MOVIE:
            return <MovieContent mediaInfo={mediaInfo} />;
        case MediaType.TV:
            return <TVShowContent mediaInfo={mediaInfo} />;
        case MediaType.SEASON:
            return <SeasonContent mediaInfo={mediaInfo} />;
        case MediaType.EPISODE:
            return <EpisodeContent mediaInfo={mediaInfo} />;
        default:
            return <span>Unhandled media type</span>;
    }
}

const mapStateToProps = state => ({
    mediaInfo: state.mediaLibrary.mediaInfo
});

export default connect(mapStateToProps, () => ({}))(ContentPanel);