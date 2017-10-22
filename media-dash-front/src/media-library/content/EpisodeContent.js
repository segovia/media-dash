import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'
import SubtitleButtonRow from '../subs/SubtitleButtonRow';
import MediaContent from './MediaContent';

class EpisodeContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            stillPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            airDate: PropTypes.string.isRequired,
            voteScore: PropTypes.number.isRequired,
        }),
        children: PropTypes.object
    };

    render() {
        const { title, overview, stillPath, airDate, voteScore } = this.props.mediaInfo;
        return (
            <div className="EpisodeContent">
                <ContentHeader
                    title={title}
                    overview={overview}
                    imagePath={stillPath}
                    imageIsWide={true}
                >
                    <h4 key="airDate">Air date: <span className="console">{airDate}</span></h4>
                    <h4 key="voteScore">Raiting: <span className="console">{voteScore}</span></h4>
                    <h4>Subtitle languages: <SubtitleButtonRow /></h4>
                </ContentHeader>
                {this.props.children}
            </div>
        );
    }
}

export default MediaContent(EpisodeContent);