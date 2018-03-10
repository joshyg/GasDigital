import React, {Component} from 'react';
import {StyleSheet, Dimensions, Image, View, Alert, ActionSheetIOS} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import _ from 'lodash/fp';
import { setPlayerValue, playNext, setPlayback } from '../actions/player';
import { navigateTo } from '../actions/navigation';
import PlayerControls from './player_controls';
import Base from './view_base';

class PlayerView extends Component {
    constructor(props) {
        super(props);
    }
    
    componentWillMount(){
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
    }

    //TODO
    isSettingTime(){

    }

    track = () => {
      let track;
      if ( ! this.props.chromecastMode ) {
        track = this.props.currentTrack;
      } else if ( ! this.props.liveMode ) {
        track = this.props.currentVideo;
      } else {
       track = this.props.currentLiveVideo;
      }
      this.props.setPlayerValue('playerHeader', track.name);
      return track;
    }

    render() {
      return (
        <Base navigation={this.props.navigation}>
          <View style={styles.container}>
            <Image 
              style={styles.thumbnail}
              source={{uri: this.track().image}}
            />
            <PlayerControls
              chromecastMode={this.props.chromecastMode}
              liveMode={this.props.liveMode}
              track={this.track()}
              navigation={this.props.navigation}
              isSettingTime={this.isSettingTime}
            />
          </View>
        </Base>
      );
    }
}


function mapStateToProps(state) {
    return {
        currentTrack: state.player.currentTrack,
        currentVideo: state.player.currentVideo,
        currentLiveVideo: state.player.currentLiveVideo,
        chromecastMode: state.player.chromecastMode,
        liveMode: state.player.liveMode,
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        playNext,
        setPlayback,
        navigateTo,
        setPlayerValue
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerView);

const { height, width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    height: 300,
    width: 300,
    marginBottom: 20,
    borderRadius: 15,
  },
});
