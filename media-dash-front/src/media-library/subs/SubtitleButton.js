import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';


class SubtitleButton extends PureComponent {
    static propTypes = {
        lang: PropTypes.string.isRequired,
        subStatus: PropTypes.object,
        addedOn: PropTypes.string.isRequired,
        onTryAnotherSub: PropTypes.func,
        onResetTestedSub: PropTypes.func
    };

    render() {
        const { lang, subStatus, onTryAnotherSub, onResetTestedSub, addedOn } = this.props;
        return (
            <DropdownButton
                className="SubtitleButton"
                key={lang} bsSize="xsmall"
                title={lang} id={`content-header-${lang}-subtitle`}
                pullRight
            >
                <MenuItem key="try-another-sub" eventKey={lang} onSelect={onTryAnotherSub}>Try another</MenuItem>
                <MenuItem key="reset-tested-sub" eventKey={lang} onSelect={onResetTestedSub}>Reset tested</MenuItem>
                {subStatus && <MenuItem key="subs-used" header>
                    {subStatus.tested.length} out of {subStatus.available} tested</MenuItem>}
                <MenuItem key="updated-on" header>Updated {formatAddedOnDate(addedOn)}</MenuItem>
            </DropdownButton>
        );
    }
}

const formatAddedOnDate = date => new Date(date).toLocaleString("en-EN", {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
});

export default SubtitleButton;