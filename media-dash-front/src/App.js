import React, { Component } from 'react';
import './App.css';
import { Grid, Navbar } from 'react-bootstrap';
import MediaFiles from './MediaFiles'

export default class App extends Component {
  render() {
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
        <MediaFiles />
      </div>
    );
  }
}