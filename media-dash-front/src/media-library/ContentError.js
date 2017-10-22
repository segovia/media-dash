import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon } from 'react-bootstrap';

class ContentError extends PureComponent {
    static propTypes = {
        error: PropTypes.shape({
            type: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired
        })
    };

    render() {
        if (!this.props.error) return null;
        const { type, message } = this.props.error;

        return (<Alert bsStyle="danger">
            <strong><Glyphicon glyph="exclamation-sign" /> {getTitle(type)}:</strong>
            <pre>{message}</pre>
        </Alert>
        );
    }
}

const getTitle = type => {
    switch (type) {
        case 'subs':
            return 'There was a problem loading the subtitles';
        case 'not_found':
            return 'There was a problem loading media info';
        default:
            return 'There was a problem';
    }
}
export default ContentError;