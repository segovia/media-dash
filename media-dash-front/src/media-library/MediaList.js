import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import './MediaList.css'

export default class MediaList extends PureComponent {
    static propTypes = {
        activeMediaEntry: PropTypes.object,
        mediaEntries: PropTypes.array.isRequired,
        onClick: PropTypes.func.isRequired
    };
    render() {
        return (
            <ListGroup className="MediaLibrary-MediaList">
                {this.props.mediaEntries.map((mediaEntry) => (
                    <ListGroupItem
                        active={this.props.activeMediaEntry && this.props.activeMediaEntry.id === mediaEntry.id}
                        onClick={() => this.props.onClick(mediaEntry)}
                        key={mediaEntry.id}
                    >
                        <span>{mediaEntry.title}</span>
                    </ListGroupItem>
                ))}
            </ListGroup>
        );
    }
}
