import React from 'react';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import {BackHandler, Text, StyleSheet, View, Dimensions, Platform, Image, StatusBar, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo, resetTo, back } from '../actions/navigation';
import BottomMenu from '../components/bottom_menu';
import PlayerFooter from './player_footer';
const { height, width } = Dimensions.get('window');
import { routeHeaders, colors, fonts } from '../constants';
import Orientation from 'react-native-orientation';
import Modal from './modal.js';
import { setPlayerValue } from '../actions/player';
import Icon from 'react-native-vector-icons/FontAwesome';

//FIXME: this component will be used to instantiate top/bottom menu
class Base extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          orientation: ''
        }

    }

    backHandler = () => {
      if ( !this.props.routes || this.props.routes.length <= 2 ) {
        return false;
      }
      this.props.navigation.goBack();
      return true;
    }

    componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.backHandler);
    }

    componentWillReceiveProps(nextProps) {
      if ( this.props.user_id != 'logged_out' && nextProps.user_id == 'logged_out' ||
           this.props.guest && ! nextProps.guest) {
        this.props.resetTo('login');
      }
    }

    componentDidMount() {
      Orientation.getOrientation((err, orientation) => {
        console.log(`Current Device Orientation: ${orientation}`);
        this.setState({orientation});
        this.props.setPlayerValue('orientation', orientation);
      });
      Orientation.addOrientationListener(this.orientationDidChange);
    }


    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress',this.backHandler);
    }

    landscapeVideo = () => {
      return ( this.props.videoMode || this.props.liveMode ) && 
        this.state.orientation != "PORTRAIT" &&
        this.state.orientation != "PORTRAITUPSIDEDOWN";
    }


    orientationDidChange = (orientation) => {
      console.log('JG: setting orientation to ', orientation);
      this.setState({orientation});
      this.props.setPlayerValue('orientation', orientation);
    }

    showPlayer() {
      if ( this.props.currentTrack && ! this.props.chromecastMode &&
           Object.keys(this.props.currentTrack).length == 0 ) {
        return false;
      }
      return this.props.navigation.state.routeName !== 'player_view' &&
             this.props.navigation.state.routeName !== 'live' &&
             ! this.props.videoMode && 
             ( !! this.props.currentTrack || this.props.chromecastMode ) ;
    }

    showMenu() {
      return this.props.navigation.state.routeName !== 'player_view' &&
             !this.landscapeVideo() &&
             ! ( this.props.isFullscreenVideo && 
               this.props.navigation.state.routeName === 'episode');
    }

    renderOfflineHeader = () => {
      if ( ! this.props.connection  && ! this.landscapeVideo() ) {
        return (
          <View style={styles.offlineHeader}>
              <Text style={styles.offlineText}>
                  {"Phone is Offline"}
              </Text>
          </View>
        );
      }
      return null;
    }

    renderHeader = () => {
      if ( ! this.landscapeVideo() && ! this.props.isFullscreenVideo &&
           this.props.navigation.state.routeName != 'live' ||
           this.props.navigation.state.routeName == 'player_view' ) {
        return (
          <View>
            <View style={styles.backButtonContainer}>
            {!this.props.hideBackButton ? 
              <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}>
                <Icon 
                  name='chevron-left'
                  size={24}
                  color='#fcf411'
                />
              </TouchableOpacity>
              :
              <View style={{width: 30}}/>
            }
            </View>
            <View style={[styles.header]} >
              <Text 
              style={{color:'#fcf411', textAlign: 'center', fontSize: 18}} >
                {routeHeaders[this.props.activeMenuItem]}
              </Text>
            </View>
          </View>
        );
      }
    }


    render() {
        return (
          <View style={styles.container}>
          {this.renderOfflineHeader()}
          {this.renderHeader()}

            <View style={styles.body}>
                {this.props.children}
            </View>

            {this.showPlayer() && (
                <PlayerFooter navigation={this.props.navigation} />
            )}

            {this.showMenu() && (
            <BottomMenu
                navigation={this.props.navigation}
                close={() => {this.props.toggleMenu();}}
                navigateTo={this.props.navigateTo}
                />
            )}
            <Modal navigation={this.props.navigation}/>
          </View>
        );
    }
}

function mapStateToProps(state) {
    return {
      videoMode: state.player.videoMode,
      liveMode: state.player.liveMode,
      currentTrack: state.player.currentTrack,
      user_id: state.auth.user_id,
      guest: state.auth.guest,
      connection: state.data.connection,
      routes: state.navigation.routes,
      isFullscreenVideo: state.player.isFullscreenVideo,
      chromecastMode: state.player.chromecastMode,
      activeMenuItem: state.navigation.activeMenuItem,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        navigateTo,
        resetTo,
        back,
        setPlayerValue,
    }, dispatch);
}

ReactMixin.onClass(Base, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(Base);


const playerHeight = 50;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: colors.bodyBackground
  },
  header: {
      paddingTop: 10,
      paddingLeft: 10,
      paddingRight: 10,
      width: width,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      marginBottom: 10,
      backgroundColor: colors.headerBackground,
  },
  backButtonContainer: {
      paddingTop: 20,
      paddingLeft: 10,
      paddingRight: 10,
      height: 52,
      marginBottom: 10,
      backgroundColor: colors.headerBackground,
      zIndex: 5,
      position:'absolute'
  },
  body: {
      flex: 1,
      position: 'relative',
      backgroundColor: colors.bodyBackground
  },
  backButton: {
    height: 20,
    width: 20,
  },
  offlineHeader: {
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center'
  },
  offlineText: {
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    color: colors.white,
    fontSize: 12,
    flexDirection: 'column'
  },
});
