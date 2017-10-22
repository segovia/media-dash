import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'


export default class MovieContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            subsStatus: PropTypes.object,
            subsError: PropTypes.string,
            subsLoading: PropTypes.bool,
            releaseDate: PropTypes.string.isRequired,
            genreIds: PropTypes.array.isRequired,
            voteScore: PropTypes.number.isRequired
        })
    };

    render() {
        const { title, overview, subsStatus, subsError, subsLoading, posterPath, releaseDate, genreIds, voteScore } = this.props.mediaInfo;
        return (
            <div className="MovieContent">
                <ContentHeader
                    {...{ title, overview, subsStatus, subsError, subsLoading } }
                    imagePath={posterPath}
                    additionalInfo={{ releaseDate, genreIds, voteScore }}
                />
            </div>
        );
    }
}