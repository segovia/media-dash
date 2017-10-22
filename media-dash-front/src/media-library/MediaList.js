import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';
import MediaListItem from './MediaListItem'
import './MediaList.css'
import { connect } from 'react-redux';
import { selectMediaEntry } from '../AppActions';
import MediaType from '../MediaType';


class MediaList extends PureComponent {
    static propTypes = {
        mediaListing: PropTypes.object.isRequired,
        openEntries: PropTypes.array.isRequired,
        activeMediaId: PropTypes.string,
        mediaIds: PropTypes.array.isRequired,
        onSelectMediaEntry: PropTypes.func.isRequired
    };

    renderItems(mediaId, indent) {
        const { mediaListing, activeMediaId, openEntries, onSelectMediaEntry } = this.props;
        const mediaEntry = mediaListing[mediaId];
        const expanded = openEntries.includes(mediaId);
        const curItem = [(
        <MediaListItem
            active={activeMediaId === mediaId}
            eventKey={mediaId}
            key={mediaId}
            isParent={!!mediaEntry.children}
            epanded={expanded}
            indent={indent}
            onClick={onSelectMediaEntry}
        >
            {mediaEntry.type === MediaType.EPISODE && mediaEntry.number + " - "}
            {mediaEntry.title}
        </MediaListItem>)];
        if (!expanded || !mediaEntry.children || mediaEntry.children.length === 0) return curItem;
        return curItem.concat(mediaEntry.children.map(
            childMediaId => this.renderItems(childMediaId, indent + 1)
        ));
    }

    render() {
        return (
            <ListGroup className="MediaLibrary-MediaList">
                {this.props.mediaIds.map(id => this.renderItems(id, 0))}
            </ListGroup>
        );
    }
}

const mapStateToProps = state => {
    return {
        mediaListing: state.mediaLibrary.mediaListing,
        openEntries: state.mediaLibrary.openEntries,
        activeMediaId: state.mediaLibrary.activeMediaId
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onSelectMediaEntry: mediaId => { dispatch(selectMediaEntry(mediaId)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MediaList);