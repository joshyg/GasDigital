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
        StatusBar 
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import ListItemSeries from './list_item_series';
import Base from './view_base';
import { showModal, getSchedule, setValue } from '../actions/data';
import { setPlayerValue } from '../actions/player';
import Video from './video_player';
import Orientation from 'react-native-orientation';
import { DEBUG_LIVE_VIEW } from '../constants';
import Chromecast from 'react-native-google-cast';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';

moment = require('moment-timezone');

class Live extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        uri:'',
        next_show: {},
        next_show_start_time: '',
        orientation: '',
        spinValue: new Animated.Value(0),
      }
    }

    componentWillMount(){
      this.props.getSchedule();
      this.props.setValue('gettingSchedule', true);
      this.setUri(this.props,true);
      this.setNextShow(this.props);
      this.checkLiveThread();
    }

    checkLiveThread = () => {
      this.setInterval( () => {
        if( this.state.uri == '' ) {
          this.setUri(this.props, true );
        }
      }, 10000);
    }
  
    componentWillUnmount() {
      if ( ! this.props.chromecastMode ) {
        this.props.setPlayerValue('liveMode', false);
      }
      this.props.setPlayerValue('isFullscreenVideo', false);
    }

    orientationDidChange = (orientation) => {
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
        console.log('JG: rotating to ', toValue );
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

    pauseChromecast = async () => {
      if ( ! this.props.isPlayingChromecast ) {
        return;
      }
      let connected = await Chromecast.isConnected();
      if ( connected ) {
         Chromecast.togglePauseCast();
         this.props.setPlayerValue('isPlayingChromecast', false );
         this.props.setPlayerValue('chromecastMode', false );
      }
    }


    setNextShow(props) {
      const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];
      let date = new moment();
      let showDate = new moment();
      // convert all dates to eastern time
      date.set("America/New_York");
      showDate.set("America/New_York");
      let next_show = this.state.next_show;
      let next_show_start_time = this.state.next_show_start_time;
      for ( let i=0; i < 7; i ++ ) {
        let currentDay = showDate.day();
        const day = weekdays[currentDay];
        for ( let show of props.schedule ) {
          if ( show.day != day ) {
            continue;
          }

          const start_hour = parseInt(show.start_time.split(':')[0]) + ( date.utcOffset() + 300 ) / 60;
          const start_min = parseInt(show.start_time.split(':')[1]) + ( date.utcOffset() + 300 ) % 60;

          let show_starts = moment(new Date(
            showDate.year(),
            showDate.month(),
            showDate.date(), 
            start_hour, 
            start_min)
          );
          if ( show_starts > date ) {
            if ( ! next_show.start_time || show_starts < next_show_start_time ) {
              next_show = show; 
              next_show_start_time = show_starts;
            }
          }
        }
        showDate.add(24*60*60*1000);
        if ( next_show.start_time ) {
          break;
        }
      }
      //console.log('JG: setting next show to ', next_show);
      this.setState({next_show,next_show_start_time});
    }

    setUri(props,pauseChromecast=false) {
      if ( DEBUG_LIVE_VIEW ) {
        let show = props.episodes[props.recentEpisodeIds[1]];
        this.setState({
          uri:show.dataUrl,
          show: show
        });
        let video = {
          uri: show.dataUrl,
          image: show.thumbnailUrl,
          name: show.name,
        }
        this.props.setPlayerValue('currentLiveVideo', video);
        this.props.setPlayerValue('isPlaying', false);
        this.props.setPlayerValue('liveMode', true);
        this.props.setPlayerValue('isFullscreenVideo', true);
        if ( pauseChromecast ) {
          this.pauseChromecast();
        }
        return;
      }
      const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];
      let date = new moment();
      // convert all dates to eastern time
      const currentYear = date.year();
      const currentMonth = date.month();
      const currentDay = date.day();
      const currentDate = date.date();
      const today = weekdays[currentDay];
      const yesterday = weekdays[( currentDay - 1 )%7];
      for ( let show of props.schedule ) {
        if ( show.day != today && show.day != yesterday ) {
          continue;
        }

        const start_hour = parseInt(show.start_time.split(':')[0]) + ( date.utcOffset() + 300 ) / 60;
        const start_min = parseInt(show.start_time.split(':')[1]) + ( date.utcOffset() + 300 ) % 60;
        let show_starts = moment(new Date(currentYear,currentMonth,currentDate, start_hour , start_min));

        const end_hour = parseInt(show.end_time.split(':')[0]) + ( date.utcOffset() + 300 ) / 60;
        const end_min = parseInt(show.end_time.split(':')[1]) + ( date.utcOffset() + 300 ) % 60;
        let show_ends = moment(new Date(currentYear,currentMonth,currentDate, end_hour, end_min));

        if ( show.day == today && show_ends < show_starts ) {
            show_ends.add(1000*60*60*24);
        } else if ( show.day == yesterday ) {
          if ( show_ends > show_starts ) {
            show_ends.add(-1000*60*60*24);
          }
          show_starts.add(-1000*60*60*24);
        }

        console.log('JG: ', show, ' is today show_starts, show_ends, date = ', show_starts, show_ends, date );
        if ( show_starts <= date && show_ends >= date ) {
          console.log('JG: show ', show, ' is now' );
          if ( this.props.channelsById[show.show_id] ) {
            let channel = this.props.channelsById[show.show_id];
            console.log('JG: setting uri to show/channel ', show, channel, " date = ", date, " currentDay = ", currentDay, " show_starts = ", show_starts );
            let uri = channel.hd_live_url;
            this.setState({
              uri:uri,
              channel: channel,
              show: {
                name: channel.title,
                thumbnailUrl: channel.thumb
              }
            });
            let video = {
              uri: uri,
              image: channel.thumb,
              name: channel.title,
            }
            this.props.setPlayerValue('currentLiveVideo', video);
            this.props.setPlayerValue('isPlaying', false);
            this.props.setPlayerValue('liveMode', true);
            this.props.setPlayerValue('isFullscreenVideo', true);
            this.pauseChromecast();
            if ( pauseChromecast ) {
              this.pauseChromecast();
            }
            return;
          }
        }
      }
      this.setState({uri:''});
    }

    onError = () => {
      if ( this.state.channel ) {
        let channel = this.state.channel;
        if ( channel.sd_live_url && this.state.uri == channel.hd_live_url ) {
          this.setState({uri:  channel.sd_live_url});
        } else if ( channel.hd_live_url && this.state.uri == channel.sd_live_url ) {
          this.setState({uri:  channel.hd_live_url});
        }
      }
    }


    componentWillReceiveProps(nextProps) {
      this.setUri(nextProps);
      this.setNextShow(this.props);
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

    }

    onToggleFullscreen = (isFullscreen) => {
      this.props.setPlayerValue('isFullscreenVideo', isFullscreen);
    }
    
    renderVideo() {
      return (
        <Video source={{uri:this.state.uri}}   // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref
          }}                                      // Store reference
          rate={1}                              // 0 is paused, 1 is normal.
          volume={1}                            // 0 is muted, 1 is normal.
          muted={false}
          paused={this.props.chromecastMode}
          playInBackground={false}                // Audio continues to play when app entering background.
          playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
          progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
          //onProgress={this.onProgress}
          resizeMode='contain'
          disableFullscreenControls={true}
          isFullscreen={true}
          disableBack={true}
          disableVolume={true}
          disableSeekbar={true}
          spinValue={this.state.spinValue}
          episode={this.getEpisodeInfo}
          live={true}
          onToggleFullscreen={this.onToggleFullscreen}
          showModal={this.props.showModal}
          chromecast_devices={this.props.chromecast_devices}
          onError={this.onError}
        />
      );
    }

    renderMessage() {
      return (
        <View style={{alignItems:'center', top: 200}}>
          <Text>No Live Show Right Now</Text>
          { this.state.next_show.show_name && (
          <Text>Next up is {this.state.next_show.show_name} at {this.state.next_show.start_time} {this.state.next_show.day} ET</Text>
          )}
        </View>
      );
    }

    renderGuestMessage() {
      return (
        <View style={{alignItems:'center', top: 200}}>
          <Text>Live shows are for premium Users only</Text>
        </View>
      );
    }


    render() {
        return (
            <Base navigation={this.props.navigation}>
              { this.state.guest ? 
                  this.renderGuestMessage() : 
                  this.state.uri ? 
                    this.renderVideo() : this.renderMessage() }
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
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        getSchedule, 
        showModal,
        setValue,
        setPlayerValue,
    }, dispatch);
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
    flexDirection: 'row'
  },
});
