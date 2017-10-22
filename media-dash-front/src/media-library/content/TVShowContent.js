import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'
import MediaContent from './MediaContent';

class TVShowContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            firstAirDate: PropTypes.string.isRequired,
            genres: PropTypes.array.isRequired,
            voteScore: PropTypes.number.isRequired,
        }),
        children: PropTypes.object
    };

    render() {
        const { title, overview, posterPath, firstAirDate, genres, voteScore } = this.props.mediaInfo;
        return (
            <div className="TVShowContent">
                <ContentHeader
                    title={title}
                    overview={overview}
                    imagePath={posterPath}
                >
                    <h4 key="firstAirDate">First air date: <span className="console">{firstAirDate}</span></h4>
                    <h4 key="genres">Genres: <span className="console">{genres.join(', ')}</span></h4>
                    <h4 key="voteScore">Raiting: <span className="console">{voteScore}</span></h4>
                </ContentHeader>
                {this.props.children}
            </div>
        );
    }
}

export default MediaContent(TVShowContent);