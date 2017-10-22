import React, { Component } from 'react';
import ContentPanel from './ContentPanel';
import Navigation from './Navigation';
import './index.css'

class MediaLibrary extends Component {
    render() {
        return (
            <div className="MediaLibrary">
                <Navigation />
                <ContentPanel />
            </div>
        );
    }
}

export default MediaLibrary;