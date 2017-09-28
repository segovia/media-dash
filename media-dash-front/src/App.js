import React from 'react';
import './App.css';
import { Grid, Navbar } from 'react-bootstrap';
import MediaLibrary from './media-library/'

export default function (props) {
    return (
        <div>
            <Navbar inverse fixedTop>
                <Grid>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="/">media-dash</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                </Grid>
            </Navbar>
            <MediaLibrary />
        </div>
    );
};