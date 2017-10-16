import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem, Alert, Glyphicon } from 'react-bootstrap';
import Immutable from 'seamless-immutable'
import './ContentHeader.css'
import LoadingSpinner from '../../LoadingSpinner';

const availableLangs = {
    eng: "English",
    cze: "Czech",
    pob: "Portugues (BR)",
    ger: "German"
};

export default class ContentHeader extends PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        imagePath: PropTypes.string.isRequired,
        imageIsWide: PropTypes.bool,
        overview: PropTypes.string,
        subLangs: PropTypes.arrayOf(PropTypes.shape({
            lang: PropTypes.string.isRequired,
            addedOn: PropTypes.string.isRequired,
        })),
        subsStatus: PropTypes.object,
        subsError: PropTypes.string,
        subsLoading: PropTypes.bool,
        additionalInfo: PropTypes.object,
        onTryAnotherSub: PropTypes.func,
        onResetTestedSub: PropTypes.func,
    };

    render() {
        const { title, imagePath, imageIsWide, overview, subLangs, subsStatus, subsLoading, additionalInfo, onTryAnotherSub, onResetTestedSub } = this.props;
        return (
            <div className="ContentHeader">
                <h3>{title}</h3>
                <div className={`ContentHeader-image${imageIsWide ? ' wide' : ''}`}>
                    <img alt="" src={`http://image.tmdb.org/t/p/w${imageIsWide ? 300 : 185}${imagePath}`} />
                </div>
                {additionalInfo && Object.entries(additionalInfo).map(e => (
                    <h4 key={e[0]}>{toWords(e[0])}: <span className="console">{toValue(e[1])}</span></h4>
                ))}
                {renderSubLangs(subLangs, subsStatus, subsLoading, onTryAnotherSub, onResetTestedSub)}
                {overview && [<h4 key="0">Overview: </h4>, <p key="1">{overview}</p>]}
                {this.props.subsError && (
                    <Alert bsStyle="danger">
                        <strong><Glyphicon glyph="exclamation-sign" /> There was a problem loading the subtitles:</strong>
                        <pre>{this.props.subsError}</pre>
                    </Alert>)}
            </div>
        );
    }
}

const renderSubLangs = (subLangs, subsStatus, subsLoading, onTryAnotherSub, onResetTestedSub) => {
    if (!subLangs) return;
    const newAvailableLangs = Object.keys(Immutable.without(availableLangs, subLangs.map(s => s.lang)));
    return subsLoading ?
        <h4>Subtitle languages: <LoadingSpinner /></h4> :
        <h4>Subtitle languages: 
        {subLangs.map(({ lang, addedOn }) => (
                <DropdownButton key={lang} bsSize="xsmall" title={lang} id={`content-header-${lang}-subtitle`} pullRight>
                    <MenuItem key="try-another-sub" eventKey={lang} onSelect={onTryAnotherSub}>Try another</MenuItem>
                    <MenuItem key="reset-tested-sub" eventKey={lang} onSelect={onResetTestedSub}>Reset tested</MenuItem>
                    {subsStatus && subsStatus[lang] && <MenuItem key="subs-used" header>
                        {subsStatus[lang].tested.length} out of {subsStatus[lang].available} tested</MenuItem>}
                    <MenuItem key="updated-on" header>Updated {formatAddedOnDate(addedOn)}</MenuItem>
                </DropdownButton>
            ))}
            <DropdownButton disabled={newAvailableLangs.length === 0} key="new" bsSize="xsmall" bsStyle="info" title="new" id="content-header-new-subtitle" pullRight>
                {newAvailableLangs.map(lang => (
                    <MenuItem key={lang} eventKey={lang} onSelect={onTryAnotherSub}>{availableLangs[lang]}</MenuItem>
                ))}
            </DropdownButton>
        </h4>
};

const toWords = camelCase => `${camelCase[0].toUpperCase()}${camelCase.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()}`;
const toValue = value => typeof value === 'string' ? value : JSON.stringify(value);
const formatAddedOnDate = date => new Date(date).toLocaleString("en-EN", {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
});