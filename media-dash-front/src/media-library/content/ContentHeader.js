import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './ContentHeader.css'

class ContentHeader extends PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        imagePath: PropTypes.string.isRequired,
        imageIsWide: PropTypes.bool,
        overview: PropTypes.string,
        children: PropTypes.array
    };

    render() {
        const { title, imagePath, imageIsWide, overview } = this.props;
        return (
            <div className="ContentHeader">
                <h3>{title}</h3>
                <div className={`ContentHeader-image${imageIsWide ? ' wide' : ''}`}>
                    <img alt="" src={`http://image.tmdb.org/t/p/w${imageIsWide ? 300 : 185}${imagePath}`} />
                </div>
                {this.props.children}
                {overview && [<h4 key="0">Overview: </h4>, <p key="1">{overview}</p>]}
            </div>
        );
    }
}

export default ContentHeader;