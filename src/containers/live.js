import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import ListItemSeries from './list_item_series';
import Base from './view_base';
import { getLiveShow, setValue } from '../actions/data';
import Video from 'react-native-video-controls';

class Live extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      }
    }

    componentWillMount(){
      this.props.getLiveShow();
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {

    }

    renderVideo() {
      return (
        <Video source={{uri:this.props.liveShowUrl}}   // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref
          }}                                      // Store reference
          rate={1}                              // 0 is paused, 1 is normal.
          volume={1}                            // 0 is muted, 1 is normal.
          muted={false}
          paused={!this.state.isPlayingVideo}                          // Pauses playback entirely.
          resizeMode="cover"
          playInBackground={false}                // Audio continues to play when app entering background.
          playWhenInactive={true}                // [iOS] Video continues to play when control or notification center are shown.
          progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
          onLoad={()=>{this.onLoad()}}               // Callback when video loads
          onEnd={this.onEndVideo}                      // Callback when playback finishes
          onError={this.onVideoError}               // Callback when video cannot be loaded
          onBuffer={this.onBuffer}                // Callback when remote video is buffering
          style={styles.video}
        />
      );
    }


    render() {
        return (
            <Base navigation={this.props.navigation}>
              { this.props.liveShowUrl ? this.renderVideo() : 
              ( <Text>{this.props.liveShowMessage}</Text> ) }
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      user_id: state.auth.user_id,
      liveShowMessage: state.data.liveShowMessage,
      liveShowUrl: state.data.liveShowUrl,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        getLiveShow,
        setValue
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
