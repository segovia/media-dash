import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem, Glyphicon } from 'react-bootstrap';
import './MediaList.css'
import MediaType from '../MediaType';

export default class MediaListItem extends PureComponent {
    static propTypes = {
        activeMediaEntry: PropTypes.object,
        indent: PropTypes.number.isRequired,
        mediaEntry: PropTypes.object.isRequired,
        onClick: PropTypes.func.isRequired,
        openEntries: PropTypes.array.isRequired
    };
    render() {
        const {mediaEntry, activeMediaEntry, indent, onClick, openEntries} = this.props;
        const indentStr = Array(indent).fill('\u00A0\u00A0\u00A0\u00A0').join('');
        return (
            <ListGroupItem
                active={activeMediaEntry && activeMediaEntry.id === mediaEntry.id}
                onClick={() => onClick(mediaEntry)}
                className={`MediaLibrary-MediaList-item ${openEntries.includes(mediaEntry.id) ? 'expanded' : ''}`}
            >
                <span>
                    {indentStr}
                    {mediaEntry.children ?
                        <Glyphicon className="MediaLibrary-MediaList-folder-indicator" glyph="triangle-right" />:
                        indent > 0 ? '\u00A0\u00A0' : ''
                    }
                    {mediaEntry.type === MediaType.EPISODE && mediaEntry.number + " - "}
                    {mediaEntry.title}
                </span>
            </ListGroupItem>
        );
    }
}
