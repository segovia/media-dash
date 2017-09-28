import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import './MediaList.css'

MediaList.propTypes = {
    activeMediaEntry: PropTypes.object,
    mediaEntries: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired
};

export default function MediaList(props) {
    return (
        <ListGroup className="MediaLibrary-MediaList">
            {props.mediaEntries.map((mediaEntry) => (
                <ListGroupItem
                    active={props.activeMediaEntry && props.activeMediaEntry.id === mediaEntry.id}
                    onClick={() => props.onClick(mediaEntry)}
                    key={mediaEntry.id}
                >
                    <span>{mediaEntry.title}</span>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};
