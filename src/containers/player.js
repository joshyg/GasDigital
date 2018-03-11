import React, { Component } from 'react';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import {View, Platform, NativeEventEmitter, NativeModules, DeviceEventEmitter, AsyncStorage} from 'react-native';
import { offlineDownloadStatus } from '../constants';
import { setTimerValue } from '../actions/player'; 
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MediaPlayer from 'react-native-video';
import MusicControl from 'react-native-music-control'
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
import _ from 'lodash/fp';
import {
    togglePlayback,
    setPlayerValue,
    playNext,
    playPrevious,
    fetchAndPlayAudio,
} from '../actions/player';

const EVENTS = [
    'playerProgress',
    'playerFinished',
    'RemotePlay',
    'RemoteToggle',
    'RemotePause',
    'RemoteStop',
    'RemoteNextTrack',
    'RemotePreviousTrack',
];

const AUDIO_REF = 'audio';
var androidProgressInterval;

const LAST_TRACK = '@LastTrack:key';
class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            source_uri: this.getSourceUri(this.props, ""),
        };
        this.onLoad = this.onLoad.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
    }
    togglePlayPause = () => {
      if ( this.props.currentTrack  && ! this.props.videoMode ) {
        this.props.setPlayerValue('isPlaying',!this.props.isPlaying)
      } else if ( this.props.currentVideo && this.props.videoMode ) {
        this.props.setPlayerValue('isPlayingVideo',!this.props.isPlayingVideo)
      }
    }
    componentWillMount() {
        console.log('JG: player mounted');
        this.onEnd = _.throttle(3000,this.onEnd);
        MusicControl.handleAudioInterruptions(true);
        MusicControl.on('play', ()=> {
          // FIXME: I noticed the following behavior on my
          // headphones: there is one button, ios triggers togglePlayPause,
          // but android only triggeres play each time.  Not sure if all 
          // phones/headphones behave this way, but will assume for now they do.
          if ( Platform.OS == 'ios' ) {
            this.props.setPlayerValue('isPlaying',true)
          } else {
            this.togglePlayPause();
          }
        })

        // on iOS this event will also be triggered by audio router change events
        // happening when headphones are unplugged or a bluetooth audio peripheral disconnects from the device
        MusicControl.on('pause', ()=> {
          this.props.setPlayerValue('isPlaying',false)
        })
    
        MusicControl.on('stop', ()=> {
          this.props.setPlayerValue('isPlaying',false)
        })

        MusicControl.on('togglePlayPause', ()=> {
          this.togglePlayPause();
        })
    
        MusicControl.on('nextTrack', ()=> {
          this.playNext();
        })
    
        MusicControl.on('previousTrack', ()=> {
          this.playPrevious();
        })

        this.updateProgress();
    }

    componentWillUnmount() {
        EVENTS.forEach(event => {
            if (this[event]) {
                this[event].remove();
            }
        });
    }

    onError(err) {
      console.log('player err', err);
    }

    onReady() {
        // console.log("Player ready");
    }

    componentDidMount() {
      MusicControl.enableBackgroundMode(true);
      MusicControl.enableControl('togglePlayPause', true);
      MusicControl.enableControl('play', true)
      MusicControl.enableControl('pause', true)
      MusicControl.enableControl('stop', false)
      /*
      if ( Platform.OS == 'android' ) {
        MusicControl.enableControl('volume', true) // Only affected when remoteVolume is enabled
        MusicControl.enableControl('remoteVolume', true)
      }
      */
    }

    //TODO repeated code that's also in player_controls container!!
    hasPrevious(props) {
        return  (props.queueIndex > 0 ) && (props.queue.length > 1);
    }

    hasNext(props) {
        return props.queueIndex < props.queue.length - 1;
    }

    getSourceUri(nextProps, currentSource) {
      // dont want to switch sources and interrupt playback
      // if a download completes in the middle of an episode
      if ( this.props.currentTrack.episode_id == nextProps.currentTrack.episode_id &&
           this.props.isPlaying && currentSource == this.props.currentTrack.audioUrl ) {
        return currentSource;
      }
      let episode_id = nextProps.currentTrack.episode_id;
      let offlineEpisode = nextProps.offlineEpisodes[episode_id];
      if ( offlineEpisode && 
           offlineEpisode.status == offlineDownloadStatus.downloaded && 
           offlineEpisode.audioUrl ) {
        return 'file://'+offlineEpisode.audioUrl;
      }

      if ( nextProps.currentTrack.audioUrl ) {
        return nextProps.currentTrack.audioUrl;
      }
      return currentSource;
    }

    componentWillReceiveProps(nextProps) {
        if ( nextProps.newTime ) {
          nextProps.setPlayerValue('newTime', null);
          this.seek(nextProps.newTime);
          return;
        }

        let source_uri = this.getSourceUri(nextProps, this.state.source_uri);
        if (source_uri !== this.state.source_uri) {
            console.log("JG: new source uri ", source_uri);
            this.setState({source_uri: source_uri});
        }

        if (this.hasNext(nextProps)) {
            MusicControl.enableControl('nextTrack', true);
        } else {
            MusicControl.enableControl('nextTrack', false);
        }
        if (this.hasPrevious(nextProps)) {
            MusicControl.enableControl('previousTrack', true);
        } else {
            MusicControl.enableControl('previousTrack', false);
        }
        
    }

    seek(time) {
        this.props.setPlayerValue('isSettingTime', true);
        if (this.refs[AUDIO_REF]) {
            this.refs[AUDIO_REF].seek(time);
        }

        this.setTimeout(()=>{ //TODO uses setTimeout to give the native media player a chance to perform the seek. Otherwise onProgress triggers first and the slider jerks back to where it was before jerking forward. Can we do this in a better way?
            this.props.setPlayerValue('isSettingTime', false);
        }, 0);
    }

    // TODO
    seekBackFifteen() {
        this.seek(this.props.newTime - 15000);
    }

    seekForwardFifteen() {
        this.seek(this.props.newTime + 15000);
    }

    setNowPlaying(now) {
        let image = this.props.currentTrack.image;
        let name = this.props.currentTrack.name;
        MusicControl.setNowPlaying({
            title: name,
            artwork: image,
            playbackDuration: this.props.timer.duration,
            elapsedPlaybackTime: now,
        });
    }

    onLoad = (data) => {
        let episode_id =  this.props.currentTrack.episode_id;
        let startTime = 0;
        if(this.props.episodeProgress && this.props.episodeProgress[episode_id]){
            startTime = this.props.episodeProgress[episode_id];
            this.seek(startTime);
        }
        

        if ( Platform.OS == 'ios' ) {
          this.setNowPlaying(startTime);
        }
    }

    onProgress(data) {
        if (!this.props.isSettingTime) {  
            this.props.setPlayerValue('timer',data);
        }
    }

    updateProgress(){
        this.setInterval( () => {
            if(this.props.currentTrack && this.props.isPlaying){
                let data  = {};
                data.episode_id = this.props.currentTrack.episode_id;
                data.currentTime = this.props.timer.currentTime;
                this.props.setTimerValue(data)
            }
        }, 8000);
    }

    playNext = () => {
        this.props.playNext();
    }

    playPrevious = () => {
      if (this.props.timer && this.props.timer.currentTime > 5) {
          this.seek(0);
      } else {
          this.props.playPrevious();
      }
    }

    isPaused(props) {
        return !props.isPlaying;
    }

    onEnd = () => {
        // let duration = parseInt(this.props.timer.duration);
        // let currentTime = parseInt(this.props.timer.currentTime);
        // if ( duration - currentTime < 10 || duration < 10 ) {
            this.props.setPlayerValue('queueIndex', this.props.queueIndex + 1);
            let episode = this.props.queue[this.props.queueIndex + 1] || {};
            let series = this.props.channelsById[episode.show_id];
            let track = {
                uri: episode.dataUrl,
                download_uri: episode.downloadUrl,
                image: episode.thumbnailUrl,
                name: episode.name,
                episode_id: episode.id,
                series_id: episode.show_id,
                audioUrl: episode.audioUrl,
                seriesTitle: series && series.title,
                episode: episode 
            };
            this.props.setPlayerValue('isPlayingVideo', false);
            this.props.setPlayerValue('videoMode', false);
            this.props.setPlayerValue('currentTrack', track);
            if ( ! track.audioUrl ) {
                this.props.fetchAndPlayAudio( episode.show_id, episode.id);
            } else {
                this.props.setPlayerValue('isPlaying', true);
            }
       // }
    }

    render() {
        if (!this.state.source_uri || this.props.videoMode) {
            return null;
        }
        
        let paused = this.isPaused(this.props);
        let playerRate = 1; // TODO: Add variable play rate
        return (
            <MediaPlayer ref={AUDIO_REF}
                source={{ uri: this.state.source_uri }}
                rate={paused ? 0 : playerRate}
                onProgress={this.onProgress}
                onEnd={this.onEnd}
                onError={this.onError}
                //onLoadStart={this.loadStart}
                onLoad={this.onLoad}
                paused={paused}
                volume={1}
                muted={false}
                repeat={this.props.isRepeating}
                playInBackground={true}       // Audio continues to play when app entering background.
                playWhenInactive={true}       // [iOS] Video continues to play when control or notification center are shown.         />
            />
        )
    }
}

function mapStateToProps(state) {
    return {
        timer: state.player.timer,
        isPlaying: state.player.isPlaying,
        isPlayingVideo: state.player.isPlayingVideo,
        isSettingTime: state.player.isSettingTime,
        currentTrack: state.player.currentTrack,
        currentVideo: state.player.currentVideo,
        videoMode: state.player.videoMode,
        newTime: state.player.newTime,
        offlineEpisodes: state.data.offlineEpisodes,
        queue: state.player.queue,
        queueIndex: state.player.queueIndex,
        episodeProgress: state.player.episodeProgress,
        channelsById: state.data.channelsById,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        togglePlayback,
        setPlayerValue,
        playNext,
        playPrevious,
        fetchAndPlayAudio,
        setTimerValue,
    }, dispatch);
}

ReactMixin.onClass(Player, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(Player);
