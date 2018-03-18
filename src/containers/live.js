import React from 'react';
import {
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
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {resetTo, navigateTo} from '../actions/navigation';
import ListItemSeries from './list_item_series';
import Base from './view_base';
import {showModal, getSchedule, setValue} from '../actions/data';
import {setPlayerValue} from '../actions/player';
import Video from './video_player';
import Orientation from 'react-native-orientation';
import {DEBUG_LIVE_VIEW} from '../constants';
import Chromecast from 'react-native-google-cast';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import KeepAwake from 'react-native-keep-awake';
import {getLiveShow} from './helper_funcs';
import {colors} from '../constants';
import Immersive from 'react-native-immersive';

moment = require('moment-timezone');

class Live extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uri: '',
      next_show: {},
      next_show_start_time: '',
      orientation: '',
      spinValue: new Animated.Value(0),
      show: {},
      isFullscreen: false,
    };
    if (Platform.OS == 'android') {
      Immersive.addImmersiveListener(this.restoreImmersive);
      Immersive.removeImmersiveListener(this.restoreImmersive);
    }
  }

  componentWillMount() {
    this.props.getSchedule();
    this.props.setValue('gettingSchedule', true);
    this.props.setPlayerValue('livePaused', false);
    this.setUri(this.props, true);
    this.setNextShow(this.props);
    this.checkLiveThread();
  }

  checkLiveThread = () => {
    this.setInterval(() => {
      if (this.state.uri == '') {
        this.setUri(this.props, true);
      }
    }, 10000);
  };

  componentWillUnmount() {
    if (!this.props.chromecastMode) {
      this.props.setPlayerValue('liveMode', false);
    }
    this.props.setPlayerValue('isFullscreenVideo', false);
  }

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

  orientationDidChange = orientation => {
    this.setState({orientation});
    let toValue;
    let shouldRotate = false;
    if (orientation.includes('PORTRAIT')) {
      toValue = 0;
      shouldRotate = true;
    } else if (orientation == 'LANDSCAPE-RIGHT') {
      toValue = 1;
      shouldRotate = true;
    } else if (orientation == 'LANDSCAPE-LEFT') {
      toValue = -1;
      shouldRotate = true;
    } else if (orientation == 'LANDSCAPE') {
      // android doesnt support specific orientation
      toValue = 1;
      shouldRotate = true;
    }
    if (shouldRotate) {
      console.log('JG: rotating to ', toValue);
      Animated.timing(this.state.spinValue, {
        toValue: toValue,
        duration: 500,
        easing: Easing.ease,
      }).start();
    }
  };

  togglePlayPause = () => {
    this.props.setPlayerValue('livePaused', !this.props.livePaused);
    this.pauseChromecast();
  };

  pauseChromecast = async () => {
    if (!this.props.isPlayingChromecast) {
      return;
    }
    let connected = await Chromecast.isConnected();
    if (connected) {
      Chromecast.togglePauseCast();
      this.props.setPlayerValue('isPlayingChromecast', false);
      this.props.setPlayerValue('chromecastMode', false);
    }
  };

  setNextShow(props) {
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    let date = new moment();
    let showDate = new moment();
    // convert all dates to eastern time
    date.set('America/New_York');
    showDate.set('America/New_York');
    let next_show = this.state.next_show;
    let next_show_start_time = this.state.next_show_start_time;
    for (let i = 0; i < 7; i++) {
      let currentDay = showDate.day();
      const day = weekdays[currentDay];
      for (let show of props.schedule) {
        if (show.day != day) {
          continue;
        }

        const start_hour =
          parseInt(show.start_time.split(':')[0]) +
          (date.utcOffset() + 300) / 60;
        const start_min =
          parseInt(show.start_time.split(':')[1]) +
          (date.utcOffset() + 300) % 60;

        let show_starts = moment(
          new Date(
            showDate.year(),
            showDate.month(),
            showDate.date(),
            start_hour,
            start_min,
          ),
        );
        if (show_starts > date) {
          if (!next_show.start_time || show_starts < next_show_start_time) {
            next_show = show;
            next_show_start_time = show_starts;
          }
        }
      }
      showDate.add(24 * 60 * 60 * 1000);
      if (next_show.start_time) {
        break;
      }
    }
    //console.log('JG: setting next show to ', next_show);
    this.setState({next_show, next_show_start_time});
  }

  setUri(props, pauseChromecast = false) {
    let show = getLiveShow(props);
    let video;
    if (!show) {
      this.setState({uri: '', show: {}});
      return;
    }
    if (DEBUG_LIVE_VIEW) {
      this.setState({
        uri: show.dataUrl,
        show: show,
      });
      let video = {
        uri: show.dataUrl,
        image: show.thumbnailUrl,
        name: show.name,
      };
    } else {
      let channel = this.props.channelsById[show.show_id];
      let uri = channel.hd_live_url;
      this.setState({
        uri: uri,
        channel: channel,
        show: {
          name: channel.title,
          thumbnailUrl: channel.thumb,
        },
      });
      video = {
        uri: uri,
        image: channel.thumb,
        name: channel.title,
      };
    }
    this.props.setPlayerValue('currentLiveVideo', video);
    this.props.setPlayerValue('isPlaying', false);
    this.props.setPlayerValue('liveMode', true);
    this.props.setPlayerValue('isFullscreenVideo', true);
    if (pauseChromecast) {
      this.pauseChromecast();
    }
  }

  onError = () => {
    if (this.state.channel) {
      let channel = this.state.channel;
      if (channel.sd_live_url && this.state.uri == channel.hd_live_url) {
        this.setState({uri: channel.sd_live_url});
      } else if (channel.hd_live_url && this.state.uri == channel.sd_live_url) {
        this.setState({uri: channel.hd_live_url});
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setUri(nextProps);
    this.setNextShow(this.props);
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
  }

  onToggleFullscreen = isFullscreen => {
    //this.props.setPlayerValue('isFullscreenVideo', isFullscreen);
    if (isFullscreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
    this.setState({isFullscreen});
    this.setImmersive(isFullscreen);
  };

  renderVideo() {
    return (
      <Video
        source={{uri: this.state.uri}} // Can be a URL or a local file.
        ref={ref => {
          this.player = ref;
        }} // Store reference
        rate={1} // 0 is paused, 1 is normal.
        volume={1} // 0 is muted, 1 is normal.
        muted={false}
        paused={this.props.chromecastMode || this.props.livePaused}
        playInBackground={true} // Audio continues to play when app entering background.
        playWhenInactive={true} // [iOS] Video continues to play when control or notification center are shown.
        progressUpdateInterval={250.0} // [iOS] Interval to fire onProgress (default to ~250ms)
        //onProgress={this.onProgress}
        resizeMode="contain"
        disableFullscreenControls={false}
        disableTimer={true}
        isFullscreen={false}
        disableBack={true}
        disableVolume={true}
        disableSeekbar={true}
        spinValue={this.state.spinValue}
        episode={this.getEpisodeInfo}
        live={true}
        onToggleFullscreen={this.onToggleFullscreen}
        onTogglePlayback={this.togglePlayPause}
        showModal={this.props.showModal}
        chromecast_devices={this.props.chromecast_devices}
        onError={this.onError}
        orientation={this.props.orientation}
        title={this.state.show.name}
      />
    );
  }

  renderMessage() {
    return (
      <View style={{alignItems: 'center', top: 200}}>
        <Text style={styles.text}>No Live Show Right Now</Text>
        {this.state.next_show.show_name && (
          <Text style={styles.text}>
            Next up is {this.state.next_show.show_name} at{' '}
            {this.state.next_show.start_time} ET {this.state.next_show.day}
          </Text>
        )}
      </View>
    );
  }

  renderGuestMessage() {
    return (
      <View style={{alignItems: 'center', top: 200}}>
        <Text style={styles.text}>Live shows are for premium Users only</Text>
      </View>
    );
  }

  render() {
    return (
      <Base navigation={this.props.navigation}>
        {this.state.uri && !this.state.guest ? <KeepAwake /> : null}
        {this.state.guest
          ? this.renderGuestMessage()
          : this.state.uri ? this.renderVideo() : this.renderMessage()}
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    guest: state.auth.guest,
    isGettingSchedule: state.data.isGettingSchedule,
    schedule: state.data.schedule,
    recentEpisodeIds: state.data.recentEpisodeIds,
    channelsById: state.data.channelsById,
    episodes: state.data.episodes,
    chromecast_devices: state.data.chromecast_devices,
    chromecastMode: state.player.chromecastMode,
    isPlayingChromecast: state.player.isPlayingChromecast,
    orientation: state.player.orientation,
    livePaused: state.player.livePaused,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      resetTo,
      navigateTo,
      getSchedule,
      showModal,
      setValue,
      setPlayerValue,
    },
    dispatch,
  );
}

ReactMixin.onClass(Live, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(Live);

const styles = StyleSheet.create({
  channelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodesContainer: {
    alignItems: 'flex-start',
  },
  episodeRow: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Avenir',
  },
});
