import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';
import LoadingSpinner from '../LoadingSpinner';
import { connect } from 'react-redux';
import MediaList from './MediaList';
import MediaType from '../MediaType';
import './Navigation.css'
import { selectTab, requestMediaListing } from '../AppActions';


class Navigation extends PureComponent {
    static propTypes = {
        mediaListing: PropTypes.object,
        activeMediaType: PropTypes.string.isRequired,
        onTabSelect: PropTypes.func.isRequired,
        requestMediaListing: PropTypes.func.isRequired
    };

    componentWillMount = () => {
        this.props.requestMediaListing();
    }

    render() {
        const { mediaListing, activeMediaType, onTabSelect } = this.props;
        if (!mediaListing) return <div className="MediaLibrary-Navigation"><LoadingSpinner /></div>
        const navList = makeNavList(mediaListing);
        return (
            <div className="MediaLibrary-Navigation">
                <Tabs
                    id="MediaLibrary-Navigation-Tabs"
                    activeKey={activeMediaType}
                    onSelect={onTabSelect}>
                    {Object.keys(navList).map(mediaType => (
                        <Tab
                            eventKey={mediaType}
                            title={mediaType}
                            key={mediaType}>
                            <MediaList
                                mediaIds={navList[mediaType]}
                                key={mediaType}
                            />
                        </Tab>
                    ))}
                </Tabs>
            </div>
        );
    }
};

const makeNavList = mediaListing => {
    return {
        [MediaType.MOVIE]: getKeysFromType(mediaListing, MediaType.MOVIE),
        [MediaType.TV]: getKeysFromType(mediaListing, MediaType.TV)
    };
};

const getKeysFromType = (mediaListing, type) => Object.entries(mediaListing).filter(e => e[1].type === type).map(e => e[0]);

const mapStateToProps = state => {
    return {
        activeMediaType: state.mediaLibrary.activeMediaType,
        mediaListing: state.mediaLibrary.mediaListing,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        requestMediaListing: () => { dispatch(requestMediaListing()) },
        onTabSelect: tabKey => { dispatch(selectTab(tabKey)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);