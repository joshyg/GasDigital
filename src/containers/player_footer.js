import React, {Component} from 'react';
import {Dimensions} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo } from '../actions/navigation';
import {
    togglePlayback,
    setPlayerValue
} from '../actions/player';

import PlayerFooterComponent from '../components/player_footer';

class PlayerFooterContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            width: Dimensions.get('window').width
        };

        this.togglePlayback = this.togglePlayback.bind(this);
        this.setCurrentTime = this.setCurrentTime.bind(this);
    }

    togglePlayback() {
        if (!this.props.track) {
            return;
        }

        this.props.togglePlayback();
    }

    getProgress() {
        return (this.props.timer.currentTime / this.props.timer.duration) * this.state.width;
    }

    setCurrentTime(val) {
      this.props.setPlayerValue('newTime', val);
    }

    isSettingTime = () => {
      this.props.setPlayerValue('isSettingTime', false)
    }

    render() {
        return (
            <PlayerFooterComponent
                navigateTo={this.props.navigateTo}
                progress={this.getProgress()}
                timer={this.props.timer}
                track={this.props.track}
                isPlaying={this.props.isPlaying}
                isPlayingAd={this.props.isPlayingAd}
                togglePlayback={this.togglePlayback}
                setCurrentTime={this.setCurrentTime}
                isSettingTime={this.isSettingTime}
                isSliderEnabled={this.props.isSliderEnabled}
                showNowPlaying={() => { 
                    this.props.navigateTo('nowPlaying')} 
                }
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        isPlaying: state.player.isPlaying,
        track: state.player.currentTrack,
        timer: state.player.timer,
        isSliderEnabled: !state.player.isSettingTime,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        togglePlayback,
        navigateTo,
        setPlayerValue
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerFooterContainer);
