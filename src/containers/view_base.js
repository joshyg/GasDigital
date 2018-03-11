import React from 'react';
import {BackHandler, Text, StyleSheet, View, Dimensions, Platform, Image, StatusBar, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo, resetTo, back } from '../actions/navigation';
import BottomMenu from '../components/bottom_menu';
import PlayerFooter from './player_footer';
const { height, width } = Dimensions.get('window');
import { routeHeaders, colors, fonts, offlineDownloadStatus } from '../constants';
import Orientation from 'react-native-orientation';
import Modal from './modal.js';
import { setPlayerValue } from '../actions/player';
import Icon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { 
  setValue, 
  addFavorite, 
  removeFavorite,
  getOfflineEpisode,
  deleteOfflineEpisode,
  displayOfflineEpisodeDownloading,
} from '../actions/data';

@connectActionSheet
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

    getPlayerHeader() {
      if ( ! this.props.playerHeader ) {
        return '';
      } else if ( this.props.playerHeader.length <= 20 ) {
        return this.props.playerHeader;
      } else {
        return this.props.playerHeader.slice(0,20) + '...';
      }
    }

    downloadOfflineEpisode = type => {
      // Immediately shows episode as downloading
      this.props.displayOfflineEpisodeDownloading(this.props.threeDotItem, type); 

      // Starts downloading, and when promise is finished, 
      // shows episode is finished downloading
      this.props.getOfflineEpisode(this.props.threeDotItem, type); 
    }

    downloadOfflineAudio = _ => {
      this.downloadOfflineEpisode('audio');
    }

    downloadOfflineVideo = _ => {
      this.downloadOfflineEpisode('video');
    }

    deleteOfflineEpisode = (type) => {
      if ( this.props.isPlaying && 
        this.props.currentTrack.episode_id == this.props.threeDotItem.id ) {
        Alert.alert( 'Forbidden', 'Cant delete download of currently playing track' );
        return;
      }
      let url;
      if ( type == 'audio' ) {
        url = this.props.offlineEpisodes[this.props.threeDotItem.id] && 
              this.props.offlineEpisodes[this.props.threeDotItem.id].audioUrl;
      } else {
        url = this.props.offlineEpisodes[this.props.threeDotItem.id] && 
              this.props.offlineEpisodes[this.props.threeDotItem.id].videoUrl;
      }
      this.props.deleteOfflineEpisode(
        this.props.threeDotItem, 
        url,
        type
      );
    }

    deleteOfflineAudio = () => {
      this.deleteOfflineEpisode(this.props.threeDotItem,'audio');
    }

    deleteOfflineVideo = () => {
      this.deleteOfflineEpisode(this.props.threeDotItem,'video');
    }

    removeFavorite = () => {
      this.props.setValue('isSettingFavorites', true);
      this.props.removeFavorite(
        this.props.user_id, 
        this.props.threeDotItem.id,
        this.props.threeDotItem.id,
      )
    }

    addFavorite = () => {
      this.props.setValue('isSettingFavorites', true);
      this.props.addFavorite(
        this.props.user_id, 
        this.props.threeDotItem.id,
        this.props.threeDotItem.id,
        this.props.threeDotItem
      )
    }

    audioDownloaded = _ => {
      let episode = this.props.threeDotItem;
      let audioDownloadingState = offlineDownloadStatus.notDownloaded;
      if (!!this.props.offlineEpisodes[episode.id] && 
          !!this.props.offlineEpisodes[episode.id].status) {
        audioDownloadingState = this.props.offlineEpisodes[episode.id].status;
      }
      return audioDownloadingState == offlineDownloadStatus.downloaded;
    }

    episodeFavorited = _ => {
      let episode = this.props.threeDotItem;
      return episode.is_favourite || this.props.favoriteEpisodes[episode.id];
    }

    onThreeDotsPress = () => {
      if ( ! this.props.threeDotItem ) {
        return;
      }
      let options = [];
      let actions = [];
      if ( this.audioDownloaded() ) {
        options.push('Remove Audio Download');
        actions.push(this.deleteOfflineAudio);
      } else {
        options.push('Download Audio');
        actions.push(this.downloadOfflineAudio);
      }
      if ( this.episodeFavorited() ) {
        options.push('Unfavorite');
        actions.push(this.removeFavorite);
      } else {
        options.push('Favorite');
        actions.push(this.addFavorite);
      }
      options.push('Cancel');
      actions.push(()=>{});
      this.props.showActionSheetWithOptions({
        options,
        cancelButtonIndex:options.length-1
      },
      buttonIndex => { 
        actions[buttonIndex]();
      });
    }

    showThreeDots = () => {
      return this.props.navigation.state.routeName == 'player_view' &&
             !this.props.liveMode ||
             this.props.navigation.state.routeName == 'episode' ;
    }

    renderHeader = () => {
      if ( ! this.landscapeVideo() && ! this.props.isFullscreenVideo &&
           this.props.navigation.state.routeName != 'live' && 
           this.props.navigation.state.routeName != 'search' ||
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
                {this.props.navigation.state.routeName == 'player_view' ||
                  this.props.navigation.state.routeName == 'episode' ? 
                  this.getPlayerHeader() : 
                  routeHeaders[this.props.activeMenuItem]}
              </Text>
            </View>
            { this.showThreeDots() && (
              <TouchableOpacity 
                style={styles.threeDotsContainer}
                onPress={this.onThreeDotsPress}>
                <EntypoIcon 
                  name={'dots-three-horizontal'}
                  size={30}
                  color='#fcf411'
                />
              </TouchableOpacity>
             )}
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
      playerHeader: state.player.playerHeader,
      offlineEpisodes: state.data.offlineEpisodes,
      favoriteEpisodes: state.data.favoriteEpisodes,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        navigateTo,
        resetTo,
        back,
        setPlayerValue,
        setValue,
        addFavorite,
        removeFavorite,
        getOfflineEpisode,
        deleteOfflineEpisode,
        displayOfflineEpisodeDownloading,
    }, dispatch);
}

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
  threeDotsContainer: {
      paddingTop: 20,
      paddingLeft: 10,
      paddingRight: 10,
      height: 52,
      marginBottom: 20,
      backgroundColor: colors.headerBackground,
      zIndex: 5,
      position:'absolute',
      right: 0
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
