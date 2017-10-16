import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'


export default class EpisodeContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            stillPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            subLangs: PropTypes.arrayOf(PropTypes.shape({
                lang: PropTypes.string.isRequired,
                addedOn: PropTypes.string.isRequired,
            })),
            subsStatus: PropTypes.object,
            subsError: PropTypes.string,
            subsLoading: PropTypes.bool,
            airDate: PropTypes.string.isRequired,
            voteScore: PropTypes.number.isRequired,
        }),
        onTryAnotherSub: PropTypes.func.isRequired,
        onResetTestedSub: PropTypes.func.isRequired
    };

    render() {
        const { title, overview, subLangs, subsStatus, subsError, subsLoading, stillPath, airDate, voteScore } = this.props.mediaInfo;
        return (
            <div className="MovieContent">
                <ContentHeader
                    {...{ title, overview, subLangs, subsStatus, subsError, subsLoading } }
                    imagePath={stillPath}
                    imageIsWide={true}
                    additionalInfo={{ airDate, voteScore }}
                    onTryAnotherSub={this.props.onTryAnotherSub}
                    onResetTestedSub={this.props.onResetTestedSub}
                />
            </div>
        );
    }
}