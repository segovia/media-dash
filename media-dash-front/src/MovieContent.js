import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'


export default class MovieContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            subLangs: PropTypes.arrayOf(PropTypes.shape({
                lang: PropTypes.string.isRequired,
                addedOn: PropTypes.string.isRequired,
            })),
            subsStatus: PropTypes.object,
            subsError: PropTypes.string,
            subsLoading: PropTypes.bool,
            releaseDate: PropTypes.string.isRequired,
            genreIds: PropTypes.array.isRequired,
            voteScore: PropTypes.number.isRequired
        }),
        onTryAnotherSub: PropTypes.func.isRequired,
        onResetTestedSub: PropTypes.func.isRequired
    };

    render() {
        const { title, overview, subLangs, subsStatus, subsError, subsLoading, posterPath, releaseDate, genreIds, voteScore } = this.props.mediaInfo;
        return (
            <div className="MovieContent">
                <ContentHeader
                    {...{ title, overview, subLangs, subsStatus, subsError, subsLoading } }
                    imagePath={posterPath}
                    additionalInfo={{ releaseDate, genreIds, voteScore }}
                    onTryAnotherSub={this.props.onTryAnotherSub}
                    onResetTestedSub={this.props.onResetTestedSub}
                />
            </div>
        );
    }
}