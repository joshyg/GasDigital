import React from 'react';
import {
  Animated,
  Easing,
  DeviceEventEmitter,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Alert,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {resetTo, navigateTo} from '../actions/navigation';
import {
  fetchAndPlayAudio,
  togglePlayback,
  setPlayerValue,
} from '../actions/player';
import {setVideoTimerValue} from '../actions/player';
import {
  addFavorite,
  removeFavorite,
  addToPlaylist,
  removeFromPlaylist,
  getOfflineEpisode,
  deleteOfflineEpisode,
  displayOfflineEpisodeDownloading,
  showModal,
} from '../actions/data';
import Base from './view_base';
import Video from './video_player';
import {
  ENABLE_DOWNLOAD_VIDEO,
  DEBUG_PREMIUM,
  offlineDownloadStatus,
  colors,
} from '../constants.js';
import Orientation from 'react-native-orientation';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import Chromecast from 'react-native-google-cast';
import KeepAwake from 'react-native-keep-awake';
import Icon from 'react-native-vector-icons/FontAwesome';
import Immersive from 'react-native-immersive';

class Episode extends React.Component {
  constructor(props) {
    super(props);
    this.playAudioTrack = this.trackAvailable(this.playAudioTrack);
    this.playVideo = this.trackAvailable(this.playVideo);
    this.downloadOffline = this.trackAvailable(this.downloadOffline);
    this.addToPlaylist = this.trackAvailable(this.addToPlaylist);
    this.updateProgress = this.updateProgress.bind(this);

    if (Platform.OS == 'android') {
      Immersive.addImmersiveListener(this.restoreImmersive);
      Immersive.removeImmersiveListener(this.restoreImmersive);
    }
  }

  state = {
    newFavoriteStatus: null,
    newOfflineStatus: null,
    inPlaylist: false,
    orientation: '',
    videoUrl: '',
    spinValue: new Animated.Value(0),
    channel: '',
    isFullscreen: false,
  };

  pauseChromecast = async () => {
    if (!this.props.isPlayingChromecast) {
      return;
    }
    let connected = await Chromecast.isConnected();
    if (connected) {
      Chromecast.togglePauseCast();
      this.props.setPlayerValue('isPlayingChromecast', false);
    }
  };

  componentWillMount() {
    let series = this.props.series;
    // better to give away episode for free in error case
    // than deny a paying user
    if (series && series.link) {
      let channel = series.link.split('cat=')[1];
      this.setState({channel});
    }
    let header = this.props.episode && this.props.episode.name;
    this.props.setPlayerValue('playerHeader', header);
    this.updateProgress();
  }

  componentWillUnmount() {
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setPlayerValue('videoMode', false);
  }

  componentWillReceiveProps(nextProps) {
    let playlistIndex = nextProps.playlist.findIndex(e => {
      return e && e.id == nextProps.episode.id;
    });
    if (playlistIndex !== -1) {
      this.setState({inPlaylist: true});
    } else {
      this.setState({inPlaylist: false});
    }
  }

  componentDidMount() {
    if (Platform.OS == 'ios') {
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

    let playlistIndex = this.props.playlist.findIndex(e => {
      return e && e.id == this.props.episode.id;
    });
    if (playlistIndex !== -1) {
      this.setState({inPlaylist: true});
    } else {
      this.setState({inPlaylist: false});
    }
  }

  orientationDidChange = orientation => {
    console.log('JG: episode setting orientation to ', orientation);
    this.setState({orientation});
    let toValue;
    let shouldRotate = false;
    if (orientation.includes('PORTRAIT')) {
      toValue = 0;
      shouldRotate = true;
      this.setImmersive(false);
    } else if (orientation == 'LANDSCAPE-RIGHT') {
      toValue = 1;
      shouldRotate = true;
      this.setImmersive(true);
    } else if (orientation == 'LANDSCAPE-LEFT') {
      toValue = -1;
      shouldRotate = true;
      this.setImmersive(true);
    } else if (orientation == 'LANDSCAPE') {
      // android doesnt support specific orientation
      toValue = 1;
      shouldRotate = true;
      this.setImmersive(true);
    }
    if (shouldRotate) {
      Animated.timing(this.state.spinValue, {
        toValue: toValue,
        duration: 500,
        easing: Easing.ease,
      }).start();
    }
  };

  trackAvailable = func => {
    if (DEBUG_PREMIUM) {
      return func;
    }
    // FIXME: what if user has login but is not premium?
    // need api support...
    if (!this.props.guest) {
      return func;
    }

    let series = this.props.series;
    // better to give away episode for free in error case
    // than deny a paying user
    if (!this.state.channel) {
      return func;
    }
    let channel = this.state.channel;
    if (
      !this.props.channelEpisodeIds[channel] ||
      this.props.channelEpisodeIds[channel].length < 10
    ) {
      return func;
    }
    for (let i = 0; i < 10; i++) {
      let episodeID = this.props.channelEpisodeIds[channel][i];
      if (episodeID == this.props.episode.id) {
        return func;
      }
    }
    if (this.props.recentEpisodeIds) {
      for (let i in this.props.recentEpisodeIds) {
        let episodeID = this.props.recentEpisodeIds[i];
        if (episodeID == this.props.episode.id) {
          return func;
        }
      }
    }

    return () => {
      Alert.alert(
        'Unavailable',
        'Must be a paid subscriber to acccess this content',
      );
    };
  };
  setQueue() {
    if (this.props.episodeContext == 'series') {
      // series is list of ids
      this.props.setPlayerValue(
        'queue',
        this.props.channelEpisodeIds[this.state.channel].map(
          x => this.props.episodes[x],
        ),
      );
      this.props.setPlayerValue('queueIndex', this.props.episodeContextIndex);
    } else if (this.props.episodeContext == 'recent') {
      // recent episodes is list of ids
      this.props.setPlayerValue(
        'queue',
        this.props.recentEpisodeIds.map(x => this.props.episodes[x]),
      );
      this.props.setPlayerValue('queueIndex', this.props.episodeContextIndex);
    } else if (this.props.episodeContext == 'playlist') {
      this.props.setPlayerValue('queue', this.props.playlist);
      this.props.setPlayerValue('queueIndex', this.props.episodeContextIndex);
    } else if (this.props.episodeContext == 'offline') {
      // offline episodes is dict of episodes
      let episodes = [];
      for (let id in this.props.offlineEpisodes) {
        if (this.props.episodes[id]) {
          episodes.push(this.props.episodes[id]);
        }
      }
      this.props.setPlayerValue('queue', episodes);
      this.props.setPlayerValue('queueIndex', this.props.episodeContextIndex);
    } else if (this.props.episodeContext == 'search') {
      // search results is list of ids
      this.props.setPlayerValue(
        'queue',
        this.props.searchResults.map(x => this.props.episodes[x]),
      );
      this.props.setPlayerValue('queueIndex', this.props.episodeContextIndex);
    } else if (this.props.episodeContext == 'favorites') {
      // fav episodes is dict of episodes
      let episodes = [];
      for (let id in this.props.favoriteEpisodes) {
        if (this.props.episodes[id]) {
          episodes.push(this.props.episodes[id]);
        }
      }
      this.props.setPlayerValue('queue', episodes);
      this.props.setPlayerValue('queueIndex', this.props.episodeContextIndex);
    } else {
      this.props.setPlayerValue('queue', []);
      this.props.setPlayerValue('queueIndex', 0);
    }
  }

  playAudioTrack = () => {
    let episode = this.props.episode || {};
    let series = this.props.series
      ? this.props.series
      : this.props.channelsById[episode.show_id];
    let series_id = (series && series.id) || '';
    let offlineEpisode = this.props.offlineEpisodes[episode.id];
    let track = {
      uri: episode.dataUrl,
      download_uri: episode.downloadUrl,
      image: episode.thumbnailUrl,
      name: episode.name,
      episode_id: episode.id,
      seriesTitle: series && series.title,
      audioUrl: episode.audioUrl,
      offlineUrl: offlineEpisode && offlineEpisode.audioUrl,
      series_id,
      episode,
      duration: episode.duration || 0,
    };
    this.setQueue();
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setPlayerValue('videoMode', false);
    this.props.setPlayerValue('chromecastMode', false);
    this.props.setPlayerValue('liveMode', false);
    this.props.setPlayerValue('currentTrack', track);
    console.log('JG: setting track to ', track);
    if (!track.audioUrl && !track.offlineUrl) {
      this.props.fetchAndPlayAudio(series_id, episode.id);
    } else if (track.audioUrl) {
      this.props.setPlayerValue('isPlaying', true);
    } else {
      return;
    }
    this.props.navigateTo('player_view');
    this.pauseChromecast();
  };

  playVideo = () => {
    if (this.props.guest) {
      return Alert.alert(
        'Unavailable',
        'Must be a paid subscriber to acccess video',
      );
    }
    let episode = this.props.episode || {};
    let series = this.props.series
      ? this.props.series
      : this.props.channelsById[episode.show_id];
    let video = {
      uri: episode.dataUrl,
      download_uri: episode.downloadUrl,
      image: episode.thumbnailUrl,
      name: episode.name,
      episode_id: episode.id,
      series_id: series && series.id,
      seriesTitle: series && series.title,
      audioUrl: episode.audioUrl,
      episode: episode,
    };
    this.props.setPlayerValue('isPlaying', false);
    this.props.setPlayerValue('chromecastMode', false);
    this.props.setPlayerValue('liveMode', false);
    this.props.setPlayerValue('isPlayingVideo', true);
    this.props.setPlayerValue('videoMode', true);
    this.props.setPlayerValue('currentVideo', video);
    this.pauseChromecast();
  };

  addToPlaylist = () => {
    this.props.addToPlaylist(this.props.episode);
  };

  downloadOffline = type => {
    // Immediately shows episode as downloading
    this.props.displayOfflineEpisodeDownloading(this.props.episode, type);

    // Starts downloading, and when promise is finished,
    // shows episode is finished downloading
    this.props.getOfflineEpisode(this.props.episode, type);
  };

  deleteOfflineEpisode = type => {
    if (
      this.props.isPlaying &&
      this.props.currentTrack.episode_id == this.props.episode.id
    ) {
      Alert.alert(
        'Forbidden',
        'Cant delete download of currently playing track',
      );
      return;
    }
    this.props.deleteOfflineEpisode(
      this.props.episode,
      type === 'audio'
        ? this.props.offlineEpisodes[this.props.episode.id].audioUrl
        : this.props.offlineEpisodes[this.props.episode.id].videoUrl,
      type,
    );
  };

  removeFavorite = () => {
    this.setState({newFavoriteStatus: false});
    this.props.removeFavorite(
      this.props.user_id,
      this.props.episode.id,
      this.props.episode.id,
    );
  };

  addFavorite = () => {
    this.setState({newFavoriteStatus: true});
    this.props.addFavorite(
      this.props.user_id,
      this.props.episode.id,
      this.props.episode.id,
      this.props.episode,
    );
  };

  onEndVideo = () => {
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setPlayerValue('videoMode', false);
  };

  onBuffer = meta => {};

  onLoad = data => {
    let episode_id = this.props.episode.id;
    let startTime = 0;
    if (
      this.props.episodeVideoProgress &&
      this.props.episodeVideoProgress[episode_id]
    ) {
      startTime = this.props.episodeVideoProgress[episode_id];
      this.player.seekTo(startTime);
    }
  };

  onProgress = data => {
    this.props.setPlayerValue('videoTimer', {
      ...data,
      playableDuration: this.props.currentTrack.duration
        ? this.props.currentTrack.duration
        : data.playableDuration,
    });
  };

  updateProgress = () => {
    this.setInterval(() => {
      if (this.props.isPlayingVideo && this.player) {
        let data = {};
        data = this.player.getTime();
        data.episode_id = this.props.episode.id;
        this.props.setVideoTimerValue(data);
      }
    }, 8000);
  };

  onVideoError = err => {};

  getVideoUri = () => {
    let returnVal;
    let episode = this.props.episode || {};
    if (this.state.videoUrl != '') {
      return this.state.videoUrl;
    }
    let episode_id = this.props.episode.id;
    let offlineEpisode = this.props.offlineEpisodes[episode_id];
    if (
      offlineEpisode &&
      offlineEpisode.videoStatus == offlineDownloadStatus.downloaded &&
      offlineEpisode.videoUrl
    ) {
      returnVal = 'file://' + offlineEpisode.videoUrl;
    } else {
      returnVal = episode.dataUrl;
    }
    console.log('JG: url = ', returnVal);
    this.setState({videoUrl: returnVal});
    return returnVal;
  };

  hasVideo = () => {
    return this.props.episode && this.props.episode.mediaType == 1;
  };

  onTogglePlayback = paused => {
    this.props.setPlayerValue('isPlayingVideo', !paused);
  };

  setImmersive = isFullscreen => {
    if (Platform.OS != 'android') {
      return;
    }
    Immersive.setImmersive(isFullscreen);
  };

  restoreImmersive = () => {
    console.log('Immersive State Changed!');
    if (this.state.isFullscreenVideo) {
      this.setImmersive(true);
    }
  };

  onToggleFullscreen = isFullscreen => {
    this.setImmersive(isFullscreen);
    this.setState({isFullscreen});
    this.props.setPlayerValue('isFullscreenVideo', isFullscreen);
    if (isFullscreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  };

  renderVideo() {
    console.log('JG: rendering video');
    return (
      <Video
        source={{uri: this.getVideoUri()}} // Can be a URL or a local file.
        style={{zIndex: 0}}
        ref={ref => {
          this.player = ref;
        }} // Store reference
        rate={1} // 0 is paused, 1 is normal.
        volume={1} // 0 is muted, 1 is normal.
        muted={false}
        paused={!this.props.isPlayingVideo} // Pauses playback entirely.
        onTogglePlayback={this.onTogglePlayback}
        playInBackground={true} // Audio continues to play when app entering background.
        playWhenInactive={true} // [iOS] Video continues to play when control or notification center are shown.
        progressUpdateInterval={250.0} // [iOS] Interval to fire onProgress (default to ~250ms)
        onLoad={() => {
          this.onLoad();
        }} // Callback when video loads
        onEnd={this.onEndVideo} // Callback when playback finishes
        onError={this.onVideoError} // Callback when video cannot be loaded
        onBuffer={this.onBuffer} // Callback when remote video is buffering
        //onProgress={this.onProgress}
        resizeMode="contain"
        disableFullscreenControls={false}
        disableBack={true}
        disableVolume={true}
        spinValue={this.state.spinValue}
        orientation={this.state.orientation || ''}
        episode={this.props.episode}
        episodeVideoProgress={this.props.episodeVideoProgress}
        live={false}
        onToggleFullscreen={this.onToggleFullscreen}
        showModal={this.props.showModal}
        chromecast_devices={this.props.chromecast_devices}
      />
    );
  }

  renderMidbar = () => {
    let episode = this.props.episode;
    if (!episode) {
      return null;
    }
    const isFavorite =
      this.state.newFavoriteStatus === null
        ? this.props.episode.is_favourite
        : this.state.newFavoriteStatus;
    let audioDownloadingState = offlineDownloadStatus.notDownloaded;
    if (
      !!this.props.offlineEpisodes[episode.id] &&
      !!this.props.offlineEpisodes[episode.id].status
    ) {
      audioDownloadingState = this.props.offlineEpisodes[episode.id].status;
    }
    let videoDownloadingState = offlineDownloadStatus.notDownloaded;
    if (
      !!this.props.offlineEpisodes[episode.id] &&
      !!this.props.offlineEpisodes[episode.id].videoStatus
    ) {
      videoDownloadingState = this.props.offlineEpisodes[episode.id]
        .videoStatus;
    }

    let audioDownloadButton, videoDownloadButton;
    switch (audioDownloadingState) {
      case offlineDownloadStatus.notDownloaded:
        audioDownloadButton = (
          <TouchableOpacity
            key="audio"
            onPress={this.downloadOffline.bind(this, 'audio')}>
            <Image
              style={styles.icon}
              source={require('../../assets/icons/download-audio.png')}
            />
          </TouchableOpacity>
        );
        break;
      case offlineDownloadStatus.downloading:
        audioDownloadButton = (
          <Image
            key="audio"
            style={styles.icon}
            source={require('../../assets/icons/spinny.gif')}
          />
        );
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
            <Image
              key="audio"
              style={iconStyle}
              source={require('../../assets/icons/checkmark.png')}
            />
          </TouchableOpacity>
        );
        break;
    }
    if (this.hasVideo() && ENABLE_DOWNLOAD_VIDEO) {
      switch (videoDownloadingState) {
        case offlineDownloadStatus.notDownloaded:
          videoDownloadButton = (
            <TouchableOpacity
              key="video"
              onPress={this.downloadOffline.bind(this, 'video')}>
              <Image
                style={styles.icon}
                source={require('../../assets/icons/download-video.png')}
              />
            </TouchableOpacity>
          );
          break;
        case offlineDownloadStatus.downloading:
          videoDownloadButton = (
            <Image
              key="video"
              style={styles.icon}
              source={require('../../assets/icons/spinny.gif')}
            />
          );
          break;
        case offlineDownloadStatus.downloaded:
          videoDownloadButton = (
            <TouchableOpacity
              key="video"
              onPress={this.deleteOfflineEpisode.bind(this, 'video')}>
              <Image
                style={styles.icon}
                source={require('../../assets/icons/checkmark.png')}
              />
            </TouchableOpacity>
          );
          break;
      }
    }
    return (
      <View style={styles.options}>
        {audioDownloadButton}
        {videoDownloadButton}
        {this.state.inPlaylist ? (
          <TouchableOpacity
            onPress={() => {
              this.props.removeFromPlaylist(this.props.episode);
            }}>
            <Image
              style={[styles.icon]}
              source={require('../../assets/icons/minus.png')}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              this.addToPlaylist();
            }}>
            <Image
              style={[styles.icon]}
              source={require('../../assets/icons/plus.png')}
            />
          </TouchableOpacity>
        )}

        {isFavorite ? (
          <TouchableOpacity onPress={this.removeFavorite}>
            <Image
              style={[styles.icon]}
              source={require('../../assets/icons/black_heart.png')}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={this.addFavorite}>
            <Image
              style={[styles.icon]}
              source={require('../../assets/icons/blank_heart.png')}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  renderButtons = () => {
    if (!this.hasVideo()) {
      return (
        <View style={styles.playButtons}>
          <TouchableOpacity
            style={styles.audioOnlyButton}
            onPress={this.playAudioTrack}>
            <Icon name={'volume-up'} size={18} color={colors.blue} />
            <Text style={styles.buttonText}> Audio</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.playButtons}>
        <TouchableOpacity style={styles.button} onPress={this.playVideo}>
          <Icon name={'video-camera'} size={18} color={colors.blue} />
          <Text style={styles.buttonText}> Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.playAudioTrack}>
          <Icon name={'volume-up'} size={18} color={colors.blue} />
          <Text style={styles.buttonText}> Audio</Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderDetails = () => {
    let episode = this.props.episode;
    if (!episode) {
      return null;
    }

    let description = episode.description;
    if (typeof description != 'string') {
      description = '';
    }
    return (
      <View>
        {this.renderButtons()}
        <Text>{'\n'}</Text>
        <Text style={styles.title}>{episode.name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    );
  };

  renderImages() {
    return (
      <View style={styles.imageContainer}>
        <Image
          style={styles.episodeImage}
          source={{
            uri: this.props.episode && this.props.episode.thumbnailUrl,
          }}
        />
      </View>
    );
  }

  render() {
    return (
      <Base
        navigation={this.props.navigation}
        threeDotItem={this.props.episode}>
        {this.props.videoMode && <KeepAwake />}
        <ScrollView contentContainerStyle={styles.container}>
          {this.props.videoMode ? this.renderVideo() : this.renderImages()}
          {(this.state.orientation.includes('PORTRAIT') ||
            !this.props.videoMode) &&
            this.renderDetails()}
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
    series: state.data.series,
    playlist: state.data.playlist,
    offlineEpisodes: state.data.offlineEpisodes,
    episodes: state.data.episodes,
    channelEpisodeIds: state.data.channelEpisodeIds,
    recentEpisodeIds: state.data.recentEpisodeIds,
    isPlaying: state.player.isPlaying,
    isPlayingVideo: state.player.isPlayingVideo,
    isPlayingChromecast: state.player.isPlayingChromecast,
    currentTrack: state.player.currentTrack,
    episodeVideoProgress: state.player.episodeVideoProgress,
    videoMode: state.player.videoMode,
    chromecast_devices: state.data.chromecast_devices,
    channelsById: state.data.channelsById,
    favoriteEpisodes: state.data.favoriteEpisodes,
    episodeContext: state.data.episodeContext,
    episodeContextIndex: state.data.episodeContextIndex,
    playlist:
      state.data.playlist &&
      state.data.playlist.filter(x => {
        return !!x;
      }),
    searchResults: state.data.searchResults,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
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
      showModal,
    },
    dispatch,
  );
}

ReactMixin.onClass(Episode, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(Episode);
const {height, width} = Dimensions.get('window');

let buttonWidth = 164;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  episodeImage: {
    height: 150,
    width: 150,
    borderRadius: 10,
  },
  description: {
    fontSize: 14,
    paddingLeft: 5,
    paddingRight: 5,
    color: colors.white,
    fontFamily: 'Avenir',
    textAlign: 'justify',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    color: colors.white,
    fontFamily: 'Avenir',
  },
  icon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
  iconTranps: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    opacity: 0.35,
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
    width: width,
  },
  playButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.yellow,
    width: 100,
    height: 40,
    justifyContent: 'center',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  audioOnlyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.yellow,
    width: 150,
    height: 40,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  buttonText: {
    color: colors.blue,
    fontFamily: 'Avenir',
  },
});
