import React from 'react';
import { Animated, Easing, DeviceEventEmitter, Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import { fetchAndPlayAudio, togglePlayback, setPlayerValue } from '../actions/player';
import { setVideoTimerValue } from '../actions/player'; 
import { 
  addFavorite,
  removeFavorite,
  addToPlaylist,
  removeFromPlaylist,
  getOfflineEpisode,
  deleteOfflineEpisode,
  displayOfflineEpisodeDownloading,
} from '../actions/data';
import Base from './view_base';
import Video from './video_player';
import { ENABLE_DOWNLOAD_VIDEO, DEBUG_PREMIUM, offlineDownloadStatus, colors } from '../constants.js';
import Orientation from 'react-native-orientation';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';

class Episode extends React.Component {
    constructor(props) {
      super(props);
      this.playAudioTrack = this.trackAvailable(this.playAudioTrack);
      this.playVideo = this.trackAvailable(this.playVideo);
      this.downloadOffline = this.trackAvailable(this.downloadOffline);
      this.addToPlaylist = this.trackAvailable(this.addToPlaylist);
      this.updateProgress = this.updateProgress.bind(this);
    }

    state = {
      newFavoriteStatus: null,
      newOfflineStatus: null,
      videoMode: false,
      isPlayingVideo: false,
      inPlaylist: false,
      orientation: '',
      videoUrl: '',
      spinValue: new Animated.Value(0),
    }

    componentWillMount(){
      this.updateProgress();
    }

    componentWillUnmount(){
      this.props.setPlayerValue('isPlayingVideo', false);
      this.props.setPlayerValue('videoMode', false);
    }


    componentWillReceiveProps(nextProps) {

      let playlistIndex = nextProps.playlist.findIndex((e)=>{return e.id == nextProps.episode.id});
      if(playlistIndex !== -1){
        this.setState({inPlaylist : true});
      }else{
        this.setState({inPlaylist : false});
      }
    }

    componentDidMount() {
      if ( Platform.OS == "ios" ) {
        Orientation.getSpecificOrientation((err, orientation) => {
          console.log(`Current Device Orientation: ${orientation}`);
          this.setState({orientation});
        });
        Orientation.addSpecificOrientationListener(this.orientationDidChange);
      } else {
        Orientation.getOrientation((err, orientation) => {
          console.log(`Current Device Orientation: ${orientation}`);
          this.setState({orientation});
        });
      }
      Orientation.addOrientationListener(this.orientationDidChange);

      let playlistIndex = this.props.playlist.findIndex((e)=>{return e.id == this.props.episode.id});
      if(playlistIndex !== -1){
        this.setState({inPlaylist : true});
      }else{
        this.setState({inPlaylist : false});
      }
    }

    orientationDidChange = (orientation) => {
      console.log('JG: episode setting orientation to ', orientation);
      this.setState({orientation});
      let toValue;
      let shouldRotate=false;
      if ( orientation.includes('PORTRAIT') ) {
        toValue = 0;
        shouldRotate = true
      } else if ( orientation == 'LANDSCAPE-RIGHT' ) {
        toValue = 1;
        shouldRotate = true
      } else if ( orientation == 'LANDSCAPE-LEFT' ) {
        toValue = -1;
        shouldRotate = true
      } else if ( orientation == 'LANDSCAPE' ) {
        // android doesnt support specific orientation
        toValue = 1;
        shouldRotate = true
      }
      if ( shouldRotate ) {
        Animated.timing(
          this.state.spinValue,
          {
            toValue: toValue,
            duration: 500,
            easing: Easing.ease
          }
        ).start()
      }
    }

    trackAvailable = (func) => {
      if ( DEBUG_PREMIUM ) {
        return func;
      }
      // FIXME: what if user has login but is not premium?
      // need api support...
      if ( ! this.props.guest ) {
        return func;
      }


      let series = this.props.series;
      // better to give away episode for free in error case
      // than deny a paying user
      if(!series){return func}
      let channel = series.link.split('cat=')[1];
      if ( ! this.props.channelEpisodeIds[channel] ||
        this.props.channelEpisodeIds[channel].length < 10 ) {
        return func;
      }
      for ( let i=0; i < 10; i++ ) {
        let episodeID = this.props.channelEpisodeIds[channel][i];
        if ( episodeID == this.props.episode.id ) {
          return func;
        }
      }
      if ( this.props.recentEpisodeIds ) {
        for ( let i in this.props.recentEpisodeIds ) {
          let episodeID = this.props.recentEpisodeIds[i];
          if ( episodeID == this.props.episode.id ) {
            return func;
          }
        } 
      } 

      return () => {
        Alert.alert( 'Unavailable', 'Must be a paid subscriber to acccess this content');
      }
    }




    playAudioTrack = () => {
      this.props.setPlayerValue('queue',[]);
      this.props.setPlayerValue('queueIndex', 0);
      let episode = this.props.episode || {};
      let series_id = this.props.series ? this.props.series.id : episode.show_id;
      let track = {
        uri: episode.dataUrl,
        download_uri: episode.downloadUrl,
        image: episode.thumbnailUrl,
        name: episode.name,
        episode_id: episode.id,
        series_id: series_id,
        audioUrl: episode.audioUrl
      }
      console.log('JG: setting track to ', track);
      this.props.setPlayerValue('isPlayingVideo', false);
      this.props.setPlayerValue('videoMode', false);
      this.setState({videoMode:false, isPlayingVideo: false});
      this.props.setPlayerValue('currentTrack', track);
      if ( ! track.audioUrl && series_id ) {
        this.props.fetchAndPlayAudio(series_id, episode.id);
      } else if ( track.audioUrl ) {
        this.props.setPlayerValue('isPlaying', true);
      } else {
        return;
      }
      this.props.navigateTo("player_view")
    }

    playVideo = () => {
      this.props.setPlayerValue('isPlaying', false);
      this.props.setPlayerValue('isPlayingVideo', true);
      this.props.setPlayerValue('videoMode', true);
      this.setState({videoMode:true, isPlayingVideo: true});
    }



    addToPlaylist = () => {
      this.props.addToPlaylist(this.props.episode);
    }

    downloadOffline = (type) => {
      // Immediately shows episode as downloading
      this.props.displayOfflineEpisodeDownloading(this.props.episode, type); 

      // Starts downloading, and when promise is finished, 
      // shows episode is finished downloading
      this.props.getOfflineEpisode(this.props.episode, type); 
    }

    deleteOfflineEpisode = (type) => {
      if ( this.props.isPlaying && 
        this.props.currentTrack.episode_id == this.props.episode.id ) {
        Alert.alert( 'Forbidden', 'Cant delete download of currently playing track' );
        return;
      }
      this.props.deleteOfflineEpisode(
        this.props.episode, 
        (type === 'audio') ? 
          this.props.offlineEpisodes[this.props.episode.id].audioUrl : 
          this.props.offlineEpisodes[this.props.episode.id].videoUrl,
        type
      );
    }

    removeFavorite = () => {
      this.setState({newFavoriteStatus: false})
      this.props.removeFavorite(
        this.props.user_id, 
        this.props.episode.id,
        this.props.episode.id,
      )
    }

    addFavorite = () => {
      this.setState({newFavoriteStatus: true})
      this.props.addFavorite(
        this.props.user_id, 
        this.props.episode.id,
        this.props.episode.id,
        this.props.episode
      )
    }

    onEndVideo = () => {
      this.setState({videoMode:false, isPlayingVideo:false});
    }

    onBuffer = (meta) => {
    }

    onLoad = (data) => {
      let episode_id =  this.props.episode.id;
      let startTime = 0;
      if( this.props.episodeVideoProgress && 
        this.props.episodeVideoProgress[episode_id]){
        startTime = this.props.episodeVideoProgress[episode_id];
        this.player.seekTo(startTime);
      }
    }

    onProgress = (data) => {
      this.props.setPlayerValue('videoTimer',data);
    }

    updateProgress()  {
      this.setInterval( () => {
        if(this.props.isPlayingVideo){
          let data = {};
          data.episode_id = this.props.episode.id;
          data.currentTime = this.player && this.player.state.currentTime;
          this.props.setVideoTimerValue(data)
        }
      }, 8000);
    }


    onVideoError = (err) => {
    }

    getVideoUri = () => {
      let returnVal;
      let episode = this.props.episode || {};
      if ( this.state.videoUrl != '' ) {
        return this.state.videoUrl;
      }
      let episode_id = this.props.episode.id;
      let offlineEpisode = this.props.offlineEpisodes[episode_id];
      if ( offlineEpisode && 
           offlineEpisode.videoStatus == offlineDownloadStatus.downloaded && 
           offlineEpisode.videoUrl ) {
        returnVal = 'file://'+offlineEpisode.videoUrl;
      } else {
        returnVal =  episode.dataUrl;
      }
      console.log("JG: url = ", returnVal);
      this.setState({videoUrl:returnVal});
      return returnVal;

    }

    hasVideo = () => {
      return this.props.episode && this.props.episode.mediaType == 1;
    }

    onTogglePlayback = (paused) => {
      this.setState({isPlayingVideo:!paused});
    }

    onToggleFullscreen = (isFullscreen) => {
      this.props.setPlayerValue('isFullscreenVideo', isFullscreen);
    }
    
    renderVideo() {
      return (
          <Video source={{uri:this.getVideoUri()}}   // Can be a URL or a local file.
            style={{zIndex:0}}
            ref={(ref) => {
              this.player = ref
            }}                                      // Store reference
            rate={1}                              // 0 is paused, 1 is normal.
            volume={1}                            // 0 is muted, 1 is normal.
            muted={false}
            paused={!this.state.isPlayingVideo}                          // Pauses playback entirely.
            onTogglePlayback={this.onTogglePlayback}
            playInBackground={false}                // Audio continues to play when app entering background.
            playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
            progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
            onLoad={()=>{this.onLoad()}}               // Callback when video loads
            onEnd={this.onEndVideo}                      // Callback when playback finishes
            onError={this.onVideoError}               // Callback when video cannot be loaded
            onBuffer={this.onBuffer}                // Callback when remote video is buffering
            //onProgress={this.onProgress}
            resizeMode='contain'
            disableFullscreenControls={false}
            disableBack={true}
            disableVolume={true}
            spinValue={this.state.spinValue}
            episode={this.props.episode}
            episodeVideoProgress={this.props.episodeVideoProgress}
            live={false}
            onToggleFullscreen={this.onToggleFullscreen}
          />
      );
    }

    renderMidbar = () => {
      let episode = this.props.episode;
      if ( ! episode ) {
        return null;
      }
      const isFavorite = this.state.newFavoriteStatus === null ? 
        this.props.episode.is_favourite : 
        this.state.newFavoriteStatus;
      let audioDownloadingState = offlineDownloadStatus.notDownloaded;
      if (!!this.props.offlineEpisodes[episode.id] && 
          !!this.props.offlineEpisodes[episode.id].status) {
        audioDownloadingState = this.props.offlineEpisodes[episode.id].status;
      }
      let videoDownloadingState = offlineDownloadStatus.notDownloaded;
      if (!!this.props.offlineEpisodes[episode.id] && 
          !!this.props.offlineEpisodes[episode.id].videoStatus) {
        videoDownloadingState = this.props.offlineEpisodes[episode.id].videoStatus;
      }

      let audioDownloadButton, videoDownloadButton;
      switch (audioDownloadingState) {
      case offlineDownloadStatus.notDownloaded:
        audioDownloadButton = (
          <TouchableOpacity key="audio" onPress={this.downloadOffline.bind(this, 'audio')}>
           <Image style={styles.icon} source={require('../../assets/icons/download-audio.png')}/>
          </TouchableOpacity>);
        break;
      case offlineDownloadStatus.downloading:
        audioDownloadButton = (
          <Image key="audio" style={styles.icon} source={require('../../assets/icons/spinny.gif')}/>);
        break;
      case offlineDownloadStatus.downloaded:
          let iconStyle = styles.icon, 
            clickHandler = this.deleteOfflineEpisode.bind(this, 'audio');
          if (this.props.currentTrack.episode_id === episode.id) {
            iconStyle = styles.iconTranps;
            clickHandler = () => {};
          }
          audioDownloadButton = (
            <TouchableOpacity onPress={clickHandler}>
              <Image key="audio" style={iconStyle} source={require('../../assets/icons/checkmark.png')}/>
            </TouchableOpacity>);
          break;
      }
      if(this.hasVideo() && ENABLE_DOWNLOAD_VIDEO) {
        switch(videoDownloadingState) {
        case offlineDownloadStatus.notDownloaded:
          videoDownloadButton = (
            <TouchableOpacity key="video" onPress={this.downloadOffline.bind(this, 'video')}>
              <Image style={styles.icon} source={require('../../assets/icons/download-video.png')}/>
            </TouchableOpacity>);
          break;
        case offlineDownloadStatus.downloading:
          videoDownloadButton = (
            <Image key="video" style={styles.icon} source={require('../../assets/icons/spinny.gif')}/>);
          break;
        case offlineDownloadStatus.downloaded:
          videoDownloadButton = (
            <TouchableOpacity key="video" onPress={this.deleteOfflineEpisode.bind(this, 'video')}>
              <Image style={styles.icon} source={require('../../assets/icons/checkmark.png')}/>
            </TouchableOpacity>);
          break;
        }            
      }
      return (
        <View style={styles.options}>
          {audioDownloadButton}
          {videoDownloadButton}
          {this.state.inPlaylist 
            ?
          <TouchableOpacity onPress={()=>{this.props.removeFromPlaylist(this.props.episode)}}>
            <Image style={[styles.icon]} source={require('../../assets/icons/minus.png')}/>
          </TouchableOpacity>
            :
          <TouchableOpacity onPress={()=>{this.addToPlaylist()}}>
            <Image style={[styles.icon]} source={require('../../assets/icons/plus.png')}/>
          </TouchableOpacity>
          }
    
          {isFavorite ? (
            <TouchableOpacity onPress={this.removeFavorite}>
              <Image style={[styles.icon]} source={require('../../assets/icons/black_heart.png')}/>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={this.addFavorite}>
               <Image style={[styles.icon]} source={require('../../assets/icons/blank_heart.png')}/>
            </TouchableOpacity>
          )}
        </View>
      );
    }


    renderButtons = () => {
      if ( ! this.hasVideo() ) {
        return (
          <View style={{alignItems:'center'}}>
            <TouchableOpacity style={styles.button} onPress={this.playAudioTrack}>
              <Image style={[styles.iconMarginRight]} source={require('../../assets/icons/play-audio.png')}/>
              <Text>Play Audio</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View style={{alignItems:'center'}}>
          <TouchableOpacity style={styles.button} onPress={this.playVideo} >
            <Image style={[styles.iconMarginRight]} source={require('../../assets/icons/play-video.png')}/>
            <Text>Play Video</Text>
          </TouchableOpacity>
          <Text>{"\n"}</Text>
          <TouchableOpacity style={styles.button} onPress={this.playAudioTrack}>
            <Image style={[styles.iconMarginRight]} source={require('../../assets/icons/play-audio.png')}/>
            <Text>Play Audio</Text>
          </TouchableOpacity>
        </View>
      );
    }

    renderDetails = () => {

      let episode = this.props.episode;
      if ( ! episode ) {
        return null;
      }

      let description = episode.description;
      if ( typeof description != 'string' ) {
        description = '';
      }
      return ( 
        <View>
          {this.renderMidbar()}
          {this.renderButtons()}
          <Text>{"\n"}</Text>
          <Text style={styles.title}>{episode.name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      );
    }

    render() {


        return (
            <Base navigation={this.props.navigation}>
              <ScrollView  contentContainerStyle={styles.container}>
                { this.state.videoMode ? this.renderVideo() : 
                (<Image 
                  style={styles.thumbnail}
                  source={{uri: this.props.episode && this.props.episode.thumbnailUrl}}
                />)
                }
                {( this.state.orientation.includes('PORTRAIT') || ! this.state.videoMode ) && this.renderDetails()}
              </ScrollView>
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      user_id: state.auth.user_id,
      guest: state.auth.guest,
      episode: state.data.episode,
      favorites: state.data.favorites,
      series: state.data.series,
      playlist: state.data.playlist,
      offlineEpisodes: state.data.offlineEpisodes,
      episodes: state.data.episodes,
      channelEpisodeIds: state.data.channelEpisodeIds,
      recentEpisodeIds: state.data.recentEpisodeIds,
      isPlaying: state.player.isPlaying,
      isPlayingVideo: state.player.isPlayingVideo,
      currentTrack: state.player.currentTrack,
      episodeVideoProgress: state.player.episodeVideoProgress,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        setPlayerValue,
        togglePlayback,
        addFavorite,
        removeFavorite,
        fetchAndPlayAudio,
        addToPlaylist,
        removeFromPlaylist,
        getOfflineEpisode,
        deleteOfflineEpisode,
        displayOfflineEpisodeDownloading,
        setVideoTimerValue,
    }, dispatch);
}

ReactMixin.onClass(Episode, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(Episode);
const { height, width } = Dimensions.get('window');
 
let buttonWidth = 200;
 if (width <  350){
     buttonWidth = 178;
 }

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    height: height/3,
    width: width,
    marginBottom: 20
  },
  description: {
    fontSize: 14,
    paddingLeft: 5,
    paddingRight: 5
  },
  title: {
    fontSize: 18,
    marginBottom: 15
  },
  icon: {
    height: 25,
    width: 25,
    resizeMode: 'contain'
  },
  iconTranps: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    opacity: .35,
  },
  iconMarginRight: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginRight: 20,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
     marginBottom: 10,
     width: width
  },
  button: {
      marginTop: 0,
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.yellow,
      backgroundColor: colors.yellow,
      width: buttonWidth,
      height: 45,
      justifyContent: 'center',
      padding: 12,
      marginLeft: 15,
      marginRight: 15,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'row',
  },
});
