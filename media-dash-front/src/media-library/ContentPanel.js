import React from 'react';
import PropTypes from 'prop-types';
import './ContentPanel.css'

ContentPanel.propTypes = {
    mediaEntry: PropTypes.object,
};

export default function ContentPanel(props) {
    const className = "MediaLibrary-ContentPanel";
    if (!props.mediaEntry) return <div className={className} ></div>;
    if (!props.mediaEntry.posterPath) return <div className={className} >Loading...</div>;

    const style = { backgroundImage: `url(http://image.tmdb.org/t/p/w1280/${props.mediaEntry.backdropPath})` };
    const poster = <img alt="" src={`http://image.tmdb.org/t/p/w185/${props.mediaEntry.posterPath}`} />;

    return (
        <div className={className} style={style} >
            <h3>{props.mediaEntry.title}</h3>
            <div className="MediaLibrary-ContentPanel-poster">
                {poster}
            </div>
            {props.mediaEntry.overview}
        </div>
    );

};