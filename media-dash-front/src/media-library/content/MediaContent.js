import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ContentError from '../ContentError'


const MediaContent = (ContentComponent) => class extends PureComponent {
    static propTypes = {
        mediaInfo: PropTypes.object.isRequired
    };

    render() {
        return (
            <ContentComponent mediaInfo={this.props.mediaInfo}>
                <ContentError error={this.props.mediaInfo.error} />
            </ContentComponent>
        );
    }
};

export default MediaContent;