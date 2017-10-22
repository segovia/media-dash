import React, { PureComponent } from 'react';
import './App.css';
import { Grid, Navbar, Button } from 'react-bootstrap';
import MediaLibrary from './media-library/';
import MediaService from './MediaService';

export default class App extends PureComponent {
    async handleClearCache() {
        await MediaService.clearCache();
        window.location.reload();
    }

    render() {
        return (
            <div className="App">
                <Navbar inverse fixedTop>
                    <Grid>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <a href="/">media-dash</a>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                            <Button
                                bsSize="xsmall"
                                bsStyle="danger"
                                className="navbar-btn pull-right"
                                onClick={this.handleClearCache}>
                                Clear cache
                            </Button>
                        </Navbar.Header>
                    </Grid>
                </Navbar>
                <MediaLibrary />
            </div>
        );
    }
};