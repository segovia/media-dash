import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './SubtitleButtonRow.css';
import SubtitleButton from './SubtitleButton';
import NewSubtitleButton from './NewSubtitleButton';
import Immutable from 'seamless-immutable';
import LoadingSpinner from '../../LoadingSpinner';
import { connect } from 'react-redux';
import { tryAnotherSub, resetTestedSub } from '../../AppActions';

const availableLangs = {
    eng: "English",
    cze: "Czech",
    pob: "Portugues (BR)",
    ger: "German"
};

class SubtitleButtonRow extends PureComponent {
    static propTypes = {
        mediaId: PropTypes.string.isRequired,
        subLangs: PropTypes.arrayOf(PropTypes.shape({
            lang: PropTypes.string.isRequired,
            addedOn: PropTypes.string.isRequired,
        })),
        subsStatus: PropTypes.object,
        loading: PropTypes.bool,
        onTryAnotherSub: PropTypes.func,
        onResetTestedSub: PropTypes.func
    };

    handleTryAnotherSub = lang => this.props.onTryAnotherSub(this.props.mediaId, lang);
    handleResetTestedSub = lang => this.props.onResetTestedSub(this.props.mediaId, lang);

    render() {
        const { subLangs, subsStatus, loading } = this.props;
        if (loading) return <div className="SubtitleButtonRow"><LoadingSpinner /></div>;
        const newAvailableLangs = Immutable.without(availableLangs, subLangs.map(s => s.lang));
        return (
            <div className="SubtitleButtonRow">
                {subLangs.map(({ lang, addedOn }) => (
                    <SubtitleButton
                        lang={lang}
                        key={lang}
                        addedOn={addedOn}
                        subStatus={subsStatus && subsStatus[lang]}
                        onTryAnotherSub={this.handleTryAnotherSub}
                        onResetTestedSub={this.handleResetTestedSub}
                    />
                ))}
                <NewSubtitleButton
                    newAvailableLangs={newAvailableLangs}
                    onTryAnotherSub={this.handleTryAnotherSub}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const mediaInfo = state.mediaLibrary.mediaInfo;
    return {
        mediaId: mediaInfo.id,
        subLangs: state.mediaLibrary.mediaListing[mediaInfo.id].subLangs,
        subsStatus: mediaInfo.subsStatus,
        loading: mediaInfo.subsLoading
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onTryAnotherSub: (...args) => { dispatch(tryAnotherSub(...args)) },
        onResetTestedSub: (...args) => { dispatch(resetTestedSub(...args)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubtitleButtonRow);