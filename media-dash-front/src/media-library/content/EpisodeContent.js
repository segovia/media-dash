import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'


export default class EpisodeContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            stillPath: PropTypes.string.isRequired,
            overview: PropTypes.string.isRequired,
            subsStatus: PropTypes.object,
            subsError: PropTypes.string,
            subsLoading: PropTypes.bool,
            airDate: PropTypes.string.isRequired,
            voteScore: PropTypes.number.isRequired,
        })
    };

    render() {
        const { title, overview, subsStatus, subsError, subsLoading, stillPath, airDate, voteScore } = this.props.mediaInfo;
        return (
            <div className="EpisodeContent">
                <ContentHeader
                    {...{ title, overview, subsStatus, subsError, subsLoading } }
                    imagePath={stillPath}
                    imageIsWide={true}
                    additionalInfo={{ airDate, voteScore }}
                />
            </div>
        );
    }
}