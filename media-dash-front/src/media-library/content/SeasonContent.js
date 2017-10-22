import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'
import MediaContent from './MediaContent';

class SeasonContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            airDate: PropTypes.string.isRequired,
            episodeCount: PropTypes.number.isRequired,
        }),
        children: PropTypes.object
    };

    render() {
        const { title, posterPath, airDate, episodeCount } = this.props.mediaInfo;
        return (
            <div className="SeasonContent">
                <ContentHeader
                    title={title}
                    imagePath={posterPath}
                >
                    <h4 key="airDate">Air date: <span className="console">{airDate}</span></h4>
                    <h4 key="episodeCount">Episode count: <span className="console">{episodeCount}</span></h4>
                </ContentHeader>
                {this.props.children}
            </div>
        );
    }
}

export default MediaContent(SeasonContent);