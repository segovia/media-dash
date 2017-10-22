import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem, Glyphicon } from 'react-bootstrap';
import './MediaList.css'

class MediaListItem extends PureComponent {
    static propTypes = {
        eventKey: PropTypes.string.isRequired,
        active: PropTypes.bool.isRequired,
        indent: PropTypes.number.isRequired,
        onClick: PropTypes.func.isRequired,
        isParent: PropTypes.bool.isRequired,
        expanded: PropTypes.bool,
        children: PropTypes.array.isRequired
    };
    handleClick = () => this.props.onClick(this.props.eventKey);
    render() {
        const {active, indent, isParent, expanded} = this.props;
        const indentStr = Array(indent).fill('\u00A0\u00A0\u00A0\u00A0').join('');
        return (
            <ListGroupItem
                active={active}
                onClick={this.handleClick}
                className={`MediaLibrary-MediaList-item ${expanded ? 'expanded' : ''}`}
            >
                <span>
                    {indentStr}
                    {isParent ?
                        <Glyphicon className="MediaLibrary-MediaList-folder-indicator" glyph="triangle-right" />:
                        indent > 0 ? '\u00A0\u00A0' : ''
                    }
                    {this.props.children}
                    
                </span>
            </ListGroupItem>
        );
    }
}

export default MediaListItem;