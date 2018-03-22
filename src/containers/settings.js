import React from 'react';

import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  Alert,
  TouchableOpacity,
  Platform,
  Image,
  AsyncStorage,
  StatusBar,
  Switch,
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {navigateTo} from '../actions/navigation';

import {logOut} from '../actions/auth';
import Base from './view_base';
import Svg from '../components/svg';
var Fabric = require('react-native-fabric');
var {Crashlytics} = Fabric;
import {DEBUG_CRASH, colors} from '../constants';
import {setPlayerValue} from '../actions/player';

class Settings extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {}

  forceCrash = () => {
    if (DEBUG_CRASH) {
      console.log('Forcing crash!');
      Crashlytics.crash();
    }
  };

  toggleContinuousPlay = () => {
    this.props.setPlayerValue('continuousPlay', !this.props.continuousPlay);
  };

  render() {
    return (
      <Base hideBackButton={true} navigation={this.props.navigation}>
        {/*
              <TouchableOpacity 
                style={styles.menuItemLast} 
                onPress={()=>{}}>
                  <Text style={styles.title}>Contact Us</Text>
              </TouchableOpacity>
                */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            this.props.navigateTo('about');
          }}
          onLongPress={this.forceCrash}>
          <Text style={styles.title}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            this.props.logOut();
          }}>
          <Text style={styles.title}>Log Out</Text>
        </TouchableOpacity>
        <View style={styles.switch}>
          <Text style={styles.title}>Continuous Play</Text>
          <Switch
            onValueChange={this.toggleContinuousPlay}
            value={this.props.continuousPlay}
            onTintColor={colors.yellow}
          />
        </View>
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    continuousPlay: state.player.continuousPlay,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      logOut,
      navigateTo,
      setPlayerValue,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'left',
    paddingLeft: 20,
    fontFamily: 'Avenir',
  },
  menuItem: {
    padding: 10,
    paddingLeft: 0,
    width: '100%',
  },
  switch: {
    padding: 10,
    paddingLeft: 0,
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
