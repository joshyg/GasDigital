import React, {Component} from 'react';
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
import Icon from 'react-native-vector-icons/Entypo';
import {connectActionSheet} from '@expo/react-native-action-sheet';
import {DEBUG_PREMIUM, offlineDownloadStatus, colors} from '../constants';
import {
  setValue,
  addFavorite,
  removeFavorite,
  addToPlaylist,
  removeFromPlaylist,
  getOfflineEpisode,
  deleteOfflineEpisode,
  displayOfflineEpisodeDownloading,
} from '../actions/data';

const {width} = Dimensions.get('window');

@connectActionSheet
class ThreeDotButton extends Component {
  constructor(props) {
    super(props);
    this.downloadOfflineEpisode = this.trackAvailable(
      this.downloadOfflineEpisode,
    );
    this.addToPlaylist = this.trackAvailable(this.addToPlaylist);
  }

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
    if (!series) {
      return func;
    }
    let channel = series.link.split('cat=')[1];
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

  addToPlaylist = () => {
    let {item} = this.props;
    this.props.addToPlaylist(item);
  };

  removeFromPlaylist = () => {
    let {item} = this.props;
    this.props.removeFromPlaylist(item);
  };

  downloadOfflineEpisode = (episode, type) => {
    // Immediately shows episode as downloading
    this.props.displayOfflineEpisodeDownloading(episode, type);

    // Starts downloading, and when promise is finished,
    // shows episode is finished downloading
    this.props.getOfflineEpisode(episode, type);
  };

  downloadOfflineAudio = episode => {
    this.downloadOfflineEpisode(episode, 'audio');
  };

  downloadOfflineVideo = episode => {
    this.downloadOfflineEpisode(episode, 'video');
  };

  deleteOfflineEpisode = (episode, type) => {
    if (
      this.props.isPlaying &&
      this.props.currentTrack.episode_id == episode.id
    ) {
      Alert.alert(
        'Forbidden',
        'Cant delete download of currently playing track',
      );
      return;
    }
    let url;
    if (type == 'audio') {
      url =
        this.props.offlineEpisodes[episode.id] &&
        this.props.offlineEpisodes[episode.id].audioUrl;
    } else {
      url =
        this.props.offlineEpisodes[episode.id] &&
        this.props.offlineEpisodes[episode.id].videoUrl;
    }
    this.props.deleteOfflineEpisode(episode, url, type);
  };

  deleteOfflineAudio = episode => {
    this.deleteOfflineEpisode(episode, 'audio');
  };

  deleteOfflineVideo = episode => {
    this.deleteOfflineEpisode(episode, 'video');
  };

  removeFavorite = episode => {
    this.props.setValue('isSettingFavorites', true);
    this.props.removeFavorite(this.props.user_id, episode.id, episode.id);
  };

  addFavorite = episode => {
    console.log('JG: add favorite episode = ', episode);
    this.props.setValue('isSettingFavorites', true);
    this.props.addFavorite(this.props.user_id, episode.id, episode.id, episode);
  };

  audioDownloaded = episode => {
    let audioDownloadingState = offlineDownloadStatus.notDownloaded;
    if (
      !!this.props.offlineEpisodes[episode.id] &&
      !!this.props.offlineEpisodes[episode.id].status
    ) {
      audioDownloadingState = this.props.offlineEpisodes[episode.id].status;
    }
    return audioDownloadingState == offlineDownloadStatus.downloaded;
  };

  episodeFavorited = episode => {
    return episode.is_favourite || this.props.favoriteEpisodes[episode.id];
  };

  episodeInPlaylist = episode => {
    if (!this.props.playlist || !episode) {
      return false;
    }
    let playlistIndex = this.props.playlist.findIndex(e => {
      return e && e.id == episode.id;
    });
    return playlistIndex !== -1;
  };

  showActionSheetWithOptions = _ => {
    let options = [];
    let actions = [];
    let {item} = this.props;
    if (!item) {
      return;
    }
    if (this.audioDownloaded(item)) {
      options.push('Remove Audio Download');
      actions.push(this.deleteOfflineAudio);
    } else {
      options.push('Download Audio');
      actions.push(this.downloadOfflineAudio);
    }
    if (this.episodeFavorited(item)) {
      options.push('Unfavorite');
      actions.push(this.removeFavorite);
    } else {
      options.push('Favorite');
      actions.push(this.addFavorite);
    }
    if (this.episodeInPlaylist(item)) {
      options.push('Remove from Playlist');
      actions.push(this.removeFromPlaylist);
    } else {
      options.push('Add to Playlist');
      actions.push(this.addToPlaylist);
    }
    options.push('Cancel');
    actions.push(() => {});
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      buttonIndex => {
        actions[buttonIndex](item);
      },
    );
  };

  render() {
    const {item} = this.props;

    if (!item) {
      return null;
    }

    let description = item && item.description;
    if (typeof description != 'string') {
      description = '';
    }
    if (description.length > 240) {
      description = description.slice(0, 240) + '...';
    }
    return (
      <TouchableOpacity
        style={this.props.style}
        onPress={this.showActionSheetWithOptions}>
        <Icon
          name={'dots-three-horizontal'}
          size={this.props.size}
          color={colors.yellow}
        />
      </TouchableOpacity>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    offlineEpisodes: state.data.offlineEpisodes,
    favoriteEpisodes: state.data.favoriteEpisodes,
    isSettingFavorites: state.data.isSettingFavorites,
    playlist: state.data.playlist,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setValue,
      addFavorite,
      removeFavorite,
      addToPlaylist,
      removeFromPlaylist,
      getOfflineEpisode,
      deleteOfflineEpisode,
      displayOfflineEpisodeDownloading,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreeDotButton);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: width,
    marginBottom: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Avenir',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '900',
    color: colors.yellow,
  },
  description: {
    fontSize: 14,
    color: colors.white,
    fontFamily: 'Avenir',
    fontWeight: '300',
  },
  icon: {
    height: 20,
    width: 20,
    marginLeft: 5,
  },
});
