import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';

class NewSubtitleButton extends PureComponent {
    static propTypes = {
        newAvailableLangs: PropTypes.object.isRequired,
        onTryAnotherSub: PropTypes.func,
    };

    render() {
        const { newAvailableLangs, onTryAnotherSub } = this.props;
        const newLangs = Object.keys(newAvailableLangs);
        return (
            <DropdownButton
                className="SubtitleButton"
                disabled={newLangs.length === 0}
                key="new"
                bsSize="xsmall"
                bsStyle="info"
                title="new"
                id="content-header-new-subtitle"
                pullRight
            >
                {newLangs.map(lang => (
                    <MenuItem key={lang} eventKey={lang} onSelect={onTryAnotherSub}>{newAvailableLangs[lang]}</MenuItem>
                ))}
            </DropdownButton>
        );
    }
}
export default NewSubtitleButton;