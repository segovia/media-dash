import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentHeader from './ContentHeader'


export default class SeasonContent extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.shape({
            title: PropTypes.string.isRequired,
            posterPath: PropTypes.string.isRequired,
            airDate: PropTypes.string.isRequired,
            episodeCount: PropTypes.number.isRequired,
        })
    };

    render() {
        const { title, posterPath, airDate, episodeCount } = this.props.mediaInfo;
        return (
            <div className="SeasonContent">
                <ContentHeader
                    {...{ title } }
                    imagePath={posterPath}
                    additionalInfo={{ airDate, episodeCount }}
                />
            </div>
        );
    }
}