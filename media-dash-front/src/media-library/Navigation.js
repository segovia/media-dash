import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';
import MediaList from './MediaList';
import './Navigation.css'

Navigation.propTypes = {
    navigation: PropTypes.object.isRequired,
    onMediaEntryClick: PropTypes.func.isRequired,
    onTabSelect: PropTypes.func.isRequired,
};

export default function Navigation(props) {
    return (
        <div className="MediaLibrary-Navigation">
            <Tabs
                id="MediaLibrary-Navigation-Tabs"
                activeKey={props.navigation.activeMediaType}
                onSelect={props.onTabSelect}>
                {Object.entries(props.navigation.mediaListing).map(([mediaType, mediaEntries]) => (
                    <Tab
                        eventKey={mediaType}
                        title={mediaType}
                        key={mediaType}>
                        <MediaList
                            activeMediaEntry={props.navigation.activeMediaEntry}
                            mediaEntries={mediaEntries}
                            onClick={props.onMediaEntryClick}
                        />
                    </Tab>
                ))}
            </Tabs>
        </div>
    );
};