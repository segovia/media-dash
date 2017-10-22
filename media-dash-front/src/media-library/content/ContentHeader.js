import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon } from 'react-bootstrap';
import Immutable from 'seamless-immutable'
import './ContentHeader.css'
import LoadingSpinner from '../../LoadingSpinner';
import SubtitleButton from './SubtitleButton';
import NewSubtitleButton from './NewSubtitleButton';
import { connect } from 'react-redux';
import { tryAnotherSub, resetTestedSub } from '../../AppActions';



const availableLangs = {
    eng: "English",
    cze: "Czech",
    pob: "Portugues (BR)",
    ger: "German"
};

class ContentHeader extends PureComponent {
    static propTypes = {
        mediaId: PropTypes.string.isRequired,
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

    handleTryAnotherSub = lang => this.props.onTryAnotherSub(this.props.mediaId, lang);
    handleResetTestedSub = lang => this.props.onResetTestedSub(this.props.mediaId, lang);

    render() {
        const { title, imagePath, imageIsWide, overview, subLangs, subsStatus, subsLoading, additionalInfo } = this.props;
        return (
            <div className="ContentHeader">
                <h3>{title}</h3>
                <div className={`ContentHeader-image${imageIsWide ? ' wide' : ''}`}>
                    <img alt="" src={`http://image.tmdb.org/t/p/w${imageIsWide ? 300 : 185}${imagePath}`} />
                </div>
                {additionalInfo && Object.entries(additionalInfo).map(e => (
                    <h4 key={e[0]}>{toWords(e[0])}: <span className="console">{toValue(e[1])}</span></h4>
                ))}
                {renderSubLangs(subLangs, subsStatus, subsLoading, this.handleTryAnotherSub, this.handleResetTestedSub)}
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
    const newAvailableLangs = Immutable.without(availableLangs, subLangs.map(s => s.lang));
    return subsLoading ?
        <h4>Subtitle languages: <LoadingSpinner /></h4> :
        <h4>Subtitle languages:
        {subLangs.map(({ lang, addedOn }) => (
                <SubtitleButton
                    lang={lang}
                    key={lang}
                    addedOn={addedOn}
                    subStatus={subsStatus && subsStatus[lang]}
                    onTryAnotherSub={onTryAnotherSub}
                    onResetTestedSub={onResetTestedSub}
                />
            ))}
            <NewSubtitleButton newAvailableLangs={newAvailableLangs} onTryAnotherSub={onTryAnotherSub} />
        </h4>
};

const toWords = camelCase => `${camelCase[0].toUpperCase()}${camelCase.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()}`;
const toValue = value => typeof value === 'string' ? value : JSON.stringify(value);

const mapStateToProps = state => {
    const mediaId = state.mediaLibrary.mediaInfo.id;
    return {
        mediaId,
        subLangs: state.mediaLibrary.mediaListing[mediaId].subLangs
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onTryAnotherSub: (mediaId, lang) => { dispatch(tryAnotherSub(mediaId, lang)) },
        onResetTestedSub: (mediaId, lang) => { dispatch(resetTestedSub(mediaId, lang)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentHeader);