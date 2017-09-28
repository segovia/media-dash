import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';
import MediaList from './MediaList';
import './Navigation.css'

Navigation.propTypes = {
    activeMediaEntry: PropTypes.object,
    activeMediaType: PropTypes.string,
    mediaListing: PropTypes.object.isRequired,
    onMediaEntryClick: PropTypes.func.isRequired,
    onTabSelect: PropTypes.func.isRequired,
};

export default function Navigation(props) {
    return (
        <div className="MediaLibrary-Navigation">
            <Tabs
                id="MediaLibrary-Navigation-Tabs"
                activeKey={props.activeMediaType}
                onSelect={props.onTabSelect}>
                {Object.keys(props.mediaListing).map((mediaType) => (
                    <Tab
                        eventKey={mediaType}
                        title={mediaType}
                        key={mediaType}>
                        <MediaList
                            activeMediaEntry={props.activeMediaEntry}
                            mediaEntries={props.mediaListing[mediaType]}
                            onClick={props.onMediaEntryClick}
                        />
                    </Tab>
                ))}
            </Tabs>
        </div>
    );
};