import React, { PureComponent } from 'react';
import './LoadingSpinner.css';

export default class LoadingSpinner extends PureComponent {
    render() {
        return (
            <div className="spinner">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
            </div>);
    }
}
