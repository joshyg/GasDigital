import React, {Component} from 'react';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import _ from 'lodash/fp';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {navigateTo} from '../actions/navigation';
import {
  togglePlayback,
  playNext,
  playPrevious,
  setCurrentTime,
  setPlayerValue,
  setPlayerRate,
  setPlayback,
  fetchAndPlayAudio,
  setVideoTimerValue,
} from '../actions/player';
import PlayerControlsComponent from '../components/player_controls';
import Chromecast from 'react-native-google-cast';

class PlayerControlsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: Dimensions.get('window').width,
    };

    this.setCurrentTime = this.setCurrentTime.bind(this);
    this.hasNext = this.hasNext.bind(this);
    this.hasPrevious = this.hasPrevious.bind(this);
    this.onPreviousPress = this.onPreviousPress.bind(this);
    this.onNextPress = this.onNextPress.bind(this);
    this.intervalId = null;
  }

  onPlayPressAudio = () => {
    if (!this.props.currentTrack.audioUrl) {
      this.props.fetchAndPlayAudio(
        this.props.currentTrack.series_id,
        this.props.currentTrack.episode_id,
      );
    } else {
      this.props.togglePlayback();
    }
  };
  onPlayPressChromecast = () => {
    Chromecast.togglePauseCast();
    this.props.setPlayerValue(
      'isPlayingChromecast',
      !this.props.isPlayingChromecast,
    );
  };

  onPlayPress = () => {
    if (!this.props.track) {
      return;
    }
    if (!this.props.chromecastMode) {
      this.onPlayPressAudio();
    } else {
      this.onPlayPressChromecast();
    }
  };

  onNextPress = () => {
    if (this.props.chromecastMode || !this.hasNext()) {
      return;
    }

    this.props.setPlayerValue('queueIndex', this.props.queueIndex + 1);
    let episode = this.props.queue[this.props.queueIndex + 1];
    if (!episode) {
      return;
    }
    let track = {
      uri: episode.dataUrl,
      download_uri: episode.downloadUrl,
      image: episode.thumbnailUrl,
      name: episode.name,
      episode_id: episode.id,
      series_id: episode.show_id,
      audioUrl: episode.audioUrl,
    };
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setPlayerValue('videoMode', false);

    this.props.setPlayerValue('currentTrack', track);
    if (!track.audioUrl) {
      this.props.fetchAndPlayAudio(episode.show_id, episode.id);
    } else {
      this.props.setPlayerValue('isPlaying', true);
    }
  };

  playPrevious = () => {
    if (this.props.chromecastMode || !this.hasPrevious()) {
      return;
    }

    this.props.setPlayerValue('queueIndex', this.props.queueIndex - 1);
    let episode = this.props.queue[this.props.queueIndex - 1];
    if (!episode) {
      return;
    }
    let track = {
      uri: episode.dataUrl,
      download_uri: episode.downloadUrl,
      image: episode.thumbnailUrl,
      name: episode.name,
      episode_id: episode.id,
      series_id: episode.show_id,
      audioUrl: episode.audioUrl,
    };
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setPlayerValue('videoMode', false);

    this.props.setPlayerValue('currentTrack', track);
    if (!track.audioUrl) {
      this.props.fetchAndPlayAudio(episode.show_id, episode.id);
    } else {
      this.props.setPlayerValue('isPlaying', true);
    }
  };

  onPreviousPress = () => {
    if (this.props.timer.currentTime < 5) {
      //if within 5 seconds of track start
      this.playPrevious();
    } else {
      this.setCurrentTime(1); //go back to track start
    }
  };

  setCurrentTime = val => {
    if (!this.props.chromecastMode) {
      this.props.setPlayerValue('newTime', val);
    } else if (!this.props.liveMode) {
      this.props.setVideoTimerValue({
        currentTime: val,
        episode_id: this.props.currentVideo.episode_id,
      });
      Chromecast.seekCast(val);
    }
  };

  seekForwardFifteen = () => {
    let timer = this.props.chromecastMode
      ? this.props.videoTimer
      : this.props.timer;
    if (!timer.playableDuration) {
      this.setCurrentTime(timer.currentTime + 15);
    } else {
      this.setCurrentTime(
        Math.min(timer.currentTime + 15, timer.playableDuration),
      );
    }
  };

  seekBackFifteen = () => {
    let timer = this.props.chromecastMode
      ? this.props.videoTimer
      : this.props.timer;
    this.setCurrentTime(Math.max(1, timer.currentTime - 15));
  };

  formatTime(time) {
    if (!time) {
      time = 0;
    }
    let mins = Math.floor(time / 60).toString();
    let secs = Math.floor(time % 60).toString();

    mins = mins.length === 1 ? `0${mins}` : mins;
    secs = secs.length === 1 ? `0${secs}` : secs;

    return `${mins}:${secs}`;
  }

  getTimer = () => {
    return this.props.chromecastMode && !this.props.liveMode
      ? this.props.videoTimer
      : this.props.timer;
  };

  getProgress = () => {
    const {currentTime, playableDuration} = this.getTimer();
    return `${this.formatTime(currentTime)} / ${this.formatTime(
      playableDuration,
    )}`;
  };

  hasPrevious() {
    return this.props.queueIndex > 0 && this.props.queue.length > 1;
  }

  hasNext() {
    return this.props.queueIndex < this.props.queue.length - 1;
  }

  componentDidMount() {}

  changeRate = () => {
    const rates = {
      1: 1.25,
      1.25: 1.5,
      1.5: 2,
      2: 1,
    };
    this.props.setPlayerRate(rates[this.props.playerRate]);
  };

  componentWillUnmount() {}

  isPlaying = () => {
    if (!this.props.chromecastMode) {
      return this.props.isPlaying;
    }
    return this.props.isPlayingChromecast;
  };

  render() {
    return (
      <PlayerControlsComponent
        navigation={this.props.navigation}
        isLoading={!this.props.track || !this.props.track.id}
        timer={this.getTimer()}
        progressTime={this.getProgress()}
        timer={this.props.timer}
        videoTimer={this.props.videoTimer}
        track={this.props.track}
        isPlaying={this.isPlaying()}
        hasPrevious={this.hasPrevious()}
        hasNext={this.hasNext()}
        onPlayPress={this.onPlayPress}
        onPreviousPress={this.onPreviousPress}
        onNextPress={this.onNextPress}
        setCurrentTime={this.setCurrentTime}
        isSliderEnabled={this.props.isSliderEnabled}
        playerRate={this.props.playerRate}
        changeRate={this.changeRate.bind(this)}
        seekForwardFifteen={this.seekForwardFifteen}
        seekBackFifteen={this.seekBackFifteen}
        chromecastMode={this.props.chromecastMode}
        liveMode={this.props.liveMode}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    timer: state.player.timer,
    videoTimer: state.player.videoTimer,
    isPlaying: state.player.isPlaying,
    isPlayingChromecast: state.player.isPlayingChromecast,
    isSliderEnabled: !state.player.isSettingTime,
    playerRate: state.player.playerRate,
    episode: state.data.episode,
    currentTrack: state.player.currentTrack,
    currentVideo: state.player.currentVideo,
    queue: state.player.queue,
    queueIndex: state.player.queueIndex,
    chromecastMode: state.player.chromecastMode,
    liveMode: state.player.liveMode,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      togglePlayback,
      playNext,
      playPrevious,
      setCurrentTime,
      navigateTo,
      setPlayback,
      setPlayerRate,
      setPlayerValue,
      fetchAndPlayAudio,
      setVideoTimerValue,
    },
    dispatch,
  );
}

ReactMixin.onClass(PlayerControlsContainer, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(
  PlayerControlsContainer,
);

const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
