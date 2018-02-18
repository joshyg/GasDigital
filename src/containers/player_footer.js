import React, {Component} from 'react';
import {Dimensions} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo } from '../actions/navigation';
import {
    togglePlayback,
    setPlayerValue,
    setVideoTimerValue,
} from '../actions/player';
import PlayerFooterComponent from '../components/player_footer';
import Chromecast from 'react-native-google-cast';

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
        if (!this.props.currentTrack && ! this.props.currentVideo) {
            return;
        }
        if ( ! this.props.chromecastMode && !!this.props.currentTrack ) {
          this.props.togglePlayback();
        } else if ( this.props.chromecastMode && this.props.currentVideo ) {
          Chromecast.togglePauseCast();
          this.props.setPlayerValue( 'isPlayingChromecast', ! this.props.isPlayingChromecast );
        }

    }

    getProgress() {
        return (this.props.timer.currentTime / this.props.timer.duration) * this.state.width;
    }

    setCurrentTime(val) {
      if ( ! this.props.chromecastMode ) {
        this.props.setPlayerValue('newTime', val);
      } else if ( ! this.props.liveMode ) {
        this.props.setVideoTimerValue({ currentTime: val, episode_id: this.props.currentVideo.episode_id  });
        Chromecast.seekCast(val);
      }
    }

    isSettingTime = () => {
      this.props.setPlayerValue('isSettingTime', false)
    }

    track = () => {
      if ( ! this.props.chromecastMode ) {
        return this.props.currentTrack;
      } else if ( ! this.props.liveMode ) {
        return this.props.currentVideo;
      }
      return this.props.currentLiveVideo;

    }

    render() {
        return (
            <PlayerFooterComponent
                navigateTo={this.props.navigateTo}
                progress={this.getProgress()}
                timer={this.props.timer}
                videoTimer={this.props.videoTimer}
                track={this.track()}
                isPlaying={this.props.isPlaying}
                isPlayingChromecast={this.props.isPlayingChromecast}
                togglePlayback={this.togglePlayback}
                setCurrentTime={this.setCurrentTime}
                isSettingTime={this.isSettingTime}
                isSliderEnabled={this.props.isSliderEnabled}
                showNowPlaying={() => { 
                    this.props.navigateTo('nowPlaying')} 
                }
                chromecastMode={this.props.chromecastMode}
                liveMode={this.props.liveMode}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        isPlaying: state.player.isPlaying,
        isPlayingChromecast: state.player.isPlayingChromecast,
        track: state.player.currentTrack,
        timer: state.player.timer,
        isSliderEnabled: !state.player.isSettingTime,
        videoTimer: state.player.videoTimer,
        currentTrack: state.player.currentTrack,
        currentVideo: state.player.currentVideo,
        currentLiveVideo: state.player.currentLiveVideo,
        chromecastMode: state.player.chromecastMode,
        liveMode: state.player.liveMode,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        togglePlayback,
        navigateTo,
        setPlayerValue,
        setVideoTimerValue,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerFooterContainer);
