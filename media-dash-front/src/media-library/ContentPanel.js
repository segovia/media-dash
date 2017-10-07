import React from 'react';
import PropTypes from 'prop-types';
import { Table, Label, Alert, Glyphicon, Button } from 'react-bootstrap';
import './ContentPanel.css'


ContentPanel.propTypes = {
    mediaInfo: PropTypes.object,
};

const isActive = (subStatus, subId) => subStatus && subStatus.active === subId;
const isTested = (subStatus, subId) => subStatus && subStatus.tested.includes(subId);

const subtitleRowStatus = (subStatus, subId) => {
    if (isActive(subStatus, subId)) return "active";
    if (isTested(subStatus, subId)) return "tested";
    return "";
}

export default function ContentPanel(props) {
    const className = "MediaLibrary-ContentPanel";
    if (!props.mediaInfo) return <div className={className} ></div>;
    if (!props.mediaInfo.posterPath) return <div className={className} >Loading...</div>;
    const style = { backgroundImage: `url(http://image.tmdb.org/t/p/w1280/${props.mediaInfo.backdropPath})` };
    const poster = <img alt="" src={`http://image.tmdb.org/t/p/w185/${props.mediaInfo.posterPath}`} />;
    const subStatus = props.mediaInfo.subsStatus && props.mediaInfo.subsStatus['eng'];
    return (
        <div className={className} style={style}><div className="MediaLibrary-ContentPanel-inner-wrapper">
            <div className="MediaLibrary-ContentPanel-header">
                <h3>{props.mediaInfo.title}</h3>
                <div className="MediaLibrary-ContentPanel-poster">
                    {poster}
                </div>
                <h4>Overview: </h4><p>{props.mediaInfo.overview}</p>
                <h4>Imdb id: <span className="console">{props.mediaInfo.imdbId}</span></h4>
                <h4>Subtitle languages:&nbsp;
                    {props.mediaInfo.subLangs.map(lang => <Label key={lang}>{lang}</Label>)}
                    {props.mediaInfo.subLangs.length === 0 && <span className="console">(none)</span>}
                </h4>
            </div>
            {props.mediaInfo.subs && (
                <Table responsive>
                    <thead><tr>
                        <th></th>
                        <th>status</th>
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
                            <tr key={sub.id} className={isActive(subStatus, sub.id) && "active"}>
                                <td>{!isActive(subStatus, sub.id) && (
                                    <Button onClick={() => props.onInstallSub(sub.id)}>
                                        Install
                                    </Button>)}
                                </td>
                                <td><Label bsStyle={isActive(subStatus, sub.id) ? "info" : "default"} >{subtitleRowStatus(subStatus, sub.id)}</Label></td>
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
            {props.mediaInfo.subsError && (
                <Alert bsStyle="danger">
                    <strong><Glyphicon glyph="exclamation-sign" /> There was a problem loading the subtitles:</strong>
                    <pre>{props.mediaInfo.subsError}</pre>
                </Alert>)}

        </div></div>
    );

};