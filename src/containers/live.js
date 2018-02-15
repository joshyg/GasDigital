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
import { getSchedule, setValue } from '../actions/data';
import { setPlayerValue } from '../actions/player';
import Video from './video_player';
moment = require('moment-timezone');
import Orientation from 'react-native-orientation';
import { DEBUG_LIVE_VIEW } from '../constants';

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
      this.setUri(this.props);
      this.setNextShow(this.props);
    }

    componentWillUnmount() {
      this.props.setPlayerValue('liveMode', false);
      this.props.setPlayerValue('isFullscreenVideo', false);
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
    setUri(props) {
      if ( DEBUG_LIVE_VIEW ) {
        console.log('JG: first recent episode = ', props.recentEpisodeIds[1]);
        let show = props.episodes[props.recentEpisodeIds[1]];
        this.setState({
          uri:show.dataUrl,
          show: show
        });
        this.props.setPlayerValue('liveMode', true);
        this.props.setPlayerValue('isFullscreenVideo', true);
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
            console.log('JG: setting uri to show show ', show, " date = ", date, " currentDay = ", currentDay, " show_starts = ", show_starts );
            this.setState({
              uri:this.props.channelsById[show.show_id].hd_live_url,
              show: {
                name: show.title,
                thumbnailUrl: show.thumb
              }
            });
            this.props.setPlayerValue('liveMode', true);
            this.props.setPlayerValue('isFullscreenVideo', true);
            return;
          }
        }
      }
      this.setState({uri:''});
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
          paused={false}
          playInBackground={false}                // Audio continues to play when app entering background.
          playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
          progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
          //onProgress={this.onProgress}
          resizeMode='contain'
          disableFullscreenControls={false}
          isFullscreen={true}
          disableBack={true}
          disableVolume={true}
          spinValue={this.state.spinValue}
          episode={this.getEpisodeInfo}
          live={true}
          onToggleFullscreen={this.onToggleFullscreen}
        />
      );
    }

    renderMessage() {
      return (
        <View style={{alignItems:'center'}}>
          <Text>No Live Show Right Now</Text>
          { this.state.next_show.show_name && (
          <Text>Next up is {this.state.next_show.show_name} at {this.state.next_show.start_time} {this.state.next_show.day} ET</Text>
          )}
        </View>
      );
    }


    render() {
        return (
            <Base navigation={this.props.navigation}>
              { this.state.uri ? this.renderVideo() : this.renderMessage() }
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      user_id: state.auth.user_id,
      isGettingSchedule: state.data.isGettingSchedule,
      schedule: state.data.schedule,
      recentEpisodeIds: state.data.recentEpisodeIds,
      channelsById: state.data.channelsById,
      episodes: state.data.episodes
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        getSchedule, 
        setValue,
        setPlayerValue,
    }, dispatch);
}

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
