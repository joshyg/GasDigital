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
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {resetTo, navigateTo} from '../actions/navigation';
import {removeFromPlaylist} from '../actions/data';
import EpisodeList from './episode_list';
import Base from './view_base';
import {getChannels, getEpisodes, setValue} from '../actions/data';
import {setPlayerValue, fetchAndPlayAudio} from '../actions/player';
import {colors} from '../constants.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import Chromecast from 'react-native-google-cast';

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.playAll = this.playAll.bind(this);
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

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

  playAll() {
    this.props.setPlayerValue('queue', this.props.playlist);
    this.props.setPlayerValue('queueIndex', 0);

    let episode = this.props.playlist[0];
    console.log('EJ::', episode);
    if (!episode) {
      return;
    }
    let track = {
      uri: episode.dataUrl,
      download_uri: episode.downloadUrl,
      image: episode.thumbnailUrl,
      name: episode.name,
      episode_id: episode.id,
      series_id: episode.show_id,
      audioUrl: episode.audioUrl,
    };
    console.log('JG: setting track to ', track);
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setPlayerValue('videoMode', false);
    this.props.setPlayerValue('chromecastMode', false);
    this.props.setPlayerValue('liveMode', false);
    this.props.setPlayerValue('currentTrack', track);
    if (!track.audioUrl) {
      this.props.fetchAndPlayAudio(episode.show_id, episode.id);
    } else {
      this.props.setPlayerValue('isPlaying', true);
    }
    this.props.navigateTo('player_view');
    this.pauseChromecast();
  }

  render() {
    return (
      <Base header="Playlist" navigation={this.props.navigation}>
        <View style={{alignItems: 'center'}}>
          {this.props.playlist && this.props.playlist.length > 0 ? (
            <TouchableOpacity style={styles.button} onPress={this.playAll}>
              <Icon name={'volume-up'} size={18} color={colors.blue} />
              <Text style={styles.buttonText}>Play All</Text>
            </TouchableOpacity>
          ) : (
            <Text>Playlist empty!</Text>
          )}
          <EpisodeList data={this.props.playlist} />
        </View>
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    isPlayingChromecast: state.player.isPlayingChromecast,
    playlist:
      state.data.playlist &&
      state.data.playlist.filter(x => {
        return !!x;
      }),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      removeFromPlaylist,
      navigateTo,
      setValue,
      setPlayerValue,
      fetchAndPlayAudio,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: 'black',
    textAlign: 'left',
    paddingLeft: 20,
    marginBottom: 20,
  },
  iconMarginRight: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginRight: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.yellow,
    width: 170,
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
