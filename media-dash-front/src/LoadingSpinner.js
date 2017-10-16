import React, { PureComponent } from 'react';
import './LoadingSpinner.css';

export default class LoadingSpinner extends PureComponent {
    render() {
        return (
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>);
    }
}
