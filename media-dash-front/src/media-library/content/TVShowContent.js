import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'


export default class TVShowContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            firstAirDate: PropTypes.string.isRequired,
            genreIds: PropTypes.array.isRequired,
            voteScore: PropTypes.number.isRequired,
        })
    };

    render() {
        const { title, overview, posterPath, firstAirDate, genreIds, voteScore } = this.props.mediaInfo;
        return (
            <div className="TVShowContent">
                <ContentHeader
                    {...{ title, overview } }
                    imagePath={posterPath}
                    additionalInfo={{ firstAirDate, genreIds, voteScore }}
                />
            </div>
        );
    }
}