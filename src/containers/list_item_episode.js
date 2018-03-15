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
import {offlineDownloadStatus, colors} from '../constants';
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
class ListItemEpisode extends Component {
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

  showActionSheetWithOptions = _ => {
    let options = [];
    let actions = [];
    let {item} = this.props;
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

    let description = item && item.description;
    if (typeof description != 'string') {
      description = '';
    }
    if (description.length > 240) {
      description = description.slice(0, 240) + '...';
    }
    return (
      <View>
        <TouchableOpacity
          style={{alignItems: 'flex-end', marginRight: 5}}
          onPress={this.showActionSheetWithOptions}>
          <Icon
            name={'dots-three-horizontal'}
            size={30}
            color={colors.yellow}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.container}
          onPress={() => {
            this.props.goToEpisode(item);
          }}>
          <View
            style={[
              this.props.playlistView ? {width: width - 50} : {width: width},
              {marginLeft: 10},
            ]}>
            <Text style={styles.title}>{item && item.name}</Text>
            <Text style={styles.description}>{description}</Text>
            {this.props.spinny && (
              <Image
                key="audio"
                style={styles.icon}
                source={require('../../assets/icons/spinny.gif')}
              />
            )}
          </View>

          {this.props.playlistView && (
            <TouchableOpacity onPress={this.props.removeFromPlaylist}>
              <Image
                source={require('../../assets/icons/minus.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    offlineEpisodes: state.data.offlineEpisodes,
    favoriteEpisodes: state.data.favoriteEpisodes,
    isSettingFavorites: state.data.isSettingFavorites,
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

export default connect(mapStateToProps, mapDispatchToProps)(ListItemEpisode);

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
