import React, { Component } from 'react';
import {
    DeviceEventEmitter,
} from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Chromecast from 'react-native-google-cast';
import { setValue } from '../actions/data';
import { setVideoTimerValue, setPlayerValue } from '../actions/player';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import { navigateTo } from '../actions/navigation';

class ChromecastComponent extends Component {
    constructor(props) {
      super(props);
      this.updateProgress = this.updateProgress.bind(this);
    }

    componentWillMount() {
      console.log('JG: chromecast mounted');
      this.scanForChromecast();
      this.updateProgress();
    }

    async updateProgress() {
      this.setInterval( async () => {
        if(this.props.chromecastMode && 
           this.props.isPlayingChromecast && 
           !this.props.liveMode) {
          let currentTime = await Chromecast.getStreamPosition();
          let data = {
            currentTime,
            episode_id: this.props.currentVideo.episode_id
          };
          this.props.setVideoTimerValue(data)
        }
      }, 4000);
    }

    async scanForChromecast() {

      DeviceEventEmitter.addListener(Chromecast.DEVICE_AVAILABLE, async (existance) => {
        console.log('JG: device available: ', existance);
        let devices = await Chromecast.getDevices();
        console.log('JG: chromecast devices = ', devices);
        this.props.setValue('chromecast_devices', devices);

      });
      // To know if the connection attempt was successful
      DeviceEventEmitter.addListener(Chromecast.DEVICE_CONNECTED, () => { 
        console.log('JG: device connected!'); 
        this.props.setPlayerValue('chromecastMode', true);
        this.props.setPlayerValue('videoMode', false);
        let video = 
          this.props.liveMode ? 
          this.props.currentLiveVideo : 
          this.props.currentVideo;
        console.log('JG: attempting to cast ', video );
        if ( video ) {
          this.props.setPlayerValue('isPlaying', false);
          this.props.setPlayerValue('isPlayingVideo', false);
          this.props.setValue('showModal', false);
          this.props.navigateTo("player_view");
          Chromecast.castMedia(
            video.uri, 
            video.name, 
            video.image ,
            !this.props.liveMode &&
            this.props.episodeVideoProgress &&
            this.props.episodeVideoProgress[video.episode_id] || 0);
          this.props.setPlayerValue( 'isPlayingChromecast', true );
        }
      });

      // If chromecast started to stream the media succesfully, it will send this event
      DeviceEventEmitter.addListener(Chromecast.MEDIA_LOADED, () => { 'JG: media loaded!' });


      // Init Chromecast SDK and starts looking for devices (uses DEFAULT APP ID)
      Chromecast.startScan();
      
      // Init Chromecast SDK and starts looking for devices using registered APP ID
      //Chromecast.startScan(APP_ID);
      
      // Does what the method says. It saves resources, use it when leaving your current view
      //Chromecast.stopScan();
      
      // Returns a boolean with the result
      //Chromecast.isConnected();
      
      // Return an array of devices' names and ids
      let devices = await Chromecast.getDevices();
      this.props.setValue('chromecast_devices', devices);
      console.log('JG: chromecast devices = ', devices);
      
      // Gets the device id, and connects to it. If it is successful, will send a broadcast
      //Chromecast.connectToDevice(DEVICE_ID);
      
      // Closes the connection to the current Chromecast
      Chromecast.disconnect();
      
      // Streams the media to the connected chromecast. Time parameter let you choose
      // in which time frame the media should start streaming
      //Chromecast.castMedia(MEDIA_URL, MEDIA_TITLE, MEDIA_IMAGE, TIME_IN_SECONDS);
      
      // Move the streaming media to the selected time frame
      //Chromecast.seekCast(TIME_IN_SECONDS);
      
      // Toggle Chromecast between pause or play state
      //Chromecast.togglePauseCast();
      
      // Get the current streaming time frame. It can be use to sync the chromecast to
      // your visual media controllers
      //Chromecast.getStreamPosition();
    }
    
    render() { return null; }

}

function mapStateToProps(state) {
    return {
      chromecast_devices: state.data.chromecast_devices,
      episodeVideoProgress: state.player.episodeVideoProgress,
      liveMode: state.player.liveMode,
      chromecastMode: state.player.chromecastMode,
      isPlayingChromecast: state.player.isPlayingChromecast,
      currentVideo: state.player.currentVideo,
      currentLiveVideo: state.player.currentLiveVideo,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      setValue,
      setPlayerValue,
      setVideoTimerValue,
      navigateTo,
    }, dispatch);
}

ReactMixin.onClass(ChromecastComponent, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(ChromecastComponent);

