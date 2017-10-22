import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'
import SubtitleButtonRow from '../subs/SubtitleButtonRow';
import MediaContent from './MediaContent';

class MovieContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            releaseDate: PropTypes.string.isRequired,
            genres: PropTypes.array.isRequired,
            voteScore: PropTypes.number.isRequired
        }),
        children: PropTypes.object
    };

    render() {
        const { title, overview, posterPath, releaseDate, genres, voteScore } = this.props.mediaInfo;
        return (
            <div className="MovieContent">
                <ContentHeader
                    title={title}
                    overview={overview}
                    imagePath={posterPath}
                >
                    <h4 key="releaseDate">Release date: <span className="console">{releaseDate}</span></h4>
                    <h4 key="genres">Genres: <span className="console">{genres.join(', ')}</span></h4>
                    <h4 key="voteScore">Raiting: <span className="console">{voteScore}</span></h4>
                    <h4>Subtitle languages: <SubtitleButtonRow /></h4>
                </ContentHeader>
                {this.props.children}
            </div>
        );
    }
}

export default MediaContent(MovieContent);