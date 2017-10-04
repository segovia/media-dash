import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import './ContentPanel.css'


ContentPanel.propTypes = {
    mediaInfo: PropTypes.object,
};

export default function ContentPanel(props) {
    const className = "MediaLibrary-ContentPanel";
    if (!props.mediaInfo) return <div className={className} ></div>;
    if (!props.mediaInfo.posterPath) return <div className={className} >Loading...</div>;

    const style = { backgroundImage: `url(http://image.tmdb.org/t/p/w1280/${props.mediaInfo.backdropPath})` };
    const poster = <img alt="" src={`http://image.tmdb.org/t/p/w185/${props.mediaInfo.posterPath}`} />;
    return (
        <div className={className} style={style} >
            <div>
                <h3>{props.mediaInfo.title}</h3>
                <div className="MediaLibrary-ContentPanel-poster">
                    {poster}
                </div>
                {props.mediaInfo.overview}
            </div>
            {props.mediaInfo.subs && (
                <Table>
                    <thead><tr>
                        <th>downloads</th>
                        <th>filename</th>
                        <th>id</th>
                        <th>lang</th>
                        <th>score</th>
                        <th>url</th>
                        <th>date</th>
                    </tr></thead>
                    <tbody>
                        {props.mediaInfo.subs.map((sub) => (
                            <tr>
                                <td>{sub.downloads}</td>
                                <td>{sub.filename}</td>
                                <td>{sub.id}</td>
                                <td>{sub.lang}</td>
                                <td>{sub.score}</td>
                                <td><a href={sub.url}>download</a></td>
                                <td>{sub.addedon}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>)}
        </div>
    );

};