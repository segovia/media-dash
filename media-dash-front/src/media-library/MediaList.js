import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';
import MediaListItem from './MediaListItem'
import './MediaList.css'

export default class MediaList extends PureComponent {
    static propTypes = {
        activeMediaEntry: PropTypes.object,
        mediaEntries: PropTypes.array.isRequired,
        onClick: PropTypes.func.isRequired,
        openEntries: PropTypes.array.isRequired
    };

    renderItems(mediaEntry, indent) {
        const { activeMediaEntry, onClick, openEntries } = this.props;
        const curItem = [(<MediaListItem
            mediaEntry={mediaEntry}
            activeMediaEntry={activeMediaEntry}
            onClick={onClick}
            openEntries={openEntries}
            indent={indent}
            key={mediaEntry.id}
        />)];
        const isOpen = openEntries.includes(mediaEntry.id);
        if (!isOpen || !mediaEntry.children || mediaEntry.children.length === 0) return curItem;
        return curItem.concat(mediaEntry.children.map(e => this.renderItems(e, indent + 1)));
    }

    render() {
        return (
            <ListGroup className="MediaLibrary-MediaList">
                {this.props.mediaEntries.map(e => this.renderItems(e, 0))}
            </ListGroup>
        );
    }
}
