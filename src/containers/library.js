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
import Base from './view_base';
import {
  getChannels,
  getFavorites,
  getEpisodes,
  setValue,
} from '../actions/data';
import {logOut} from '../actions/auth';
import {
  colors,
  FETCH_FAVES_FROM_SERVER,
  offlineDownloadStatus,
} from '../constants';
const {height, width} = Dimensions.get('window');

class Library extends React.Component {
  componentWillMount() {
    this.props.setValue('isGettingFavorites', true);
    if (FETCH_FAVES_FROM_SERVER && !this.props.guest) {
      this.props.getFavorites(this.props.user_id);
    }
    this.setState({
      faves: this.getFaves(),
    });
  }
  getFaves() {
    let faves = [];
    for (ep in this.props.favoriteEpisodes) {
      let episode = this.props.favoriteEpisodes[ep];
      if (episode) {
        faves.push(episode);
      }
    }
    return faves;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isGettingFavorites && !nextProps.isGettingFavorites) {
      this.setState({faves: this.getFaves()});
    }
  }

  goToPage(item) {
    this.props.navigateTo(item);
  }

  goToEpisode = item => {
    this.props.setValue('episode', item);
    this.props.navigateTo('episode');
  };

  getOfflineEpisodes = () => {
    let flatListItems = [];
    let offlineEps = [];
    for (offlineEpId in this.props.offlineEpisodes) {
      // Add downloaded audio files
      if (
        this.props.offlineEpisodes[offlineEpId].status ==
        offlineDownloadStatus.downloaded
      ) {
        offlineEps.push({
          ...this.props.episodes[offlineEpId],
          showFaded: false,
        });
      }
      for (offlineEpId in this.props.offlineEpisodes) {
        // Add downloading audio files
        if (
          this.props.offlineEpisodes[offlineEpId].status ==
          offlineDownloadStatus.downloading
        ) {
          offlineEps.push({
            ...this.props.episodes[offlineEpId],
            showFaded: true,
          });
        }
      }
    }
    return offlineEps;
  };

  getOfflineVideos = () => {
    let flatListItems = [];
    let offlineEps = [];
    for (offlineEpId in this.props.offlineEpisodes) {
      // Add downloading audio files
      if (
        this.props.offlineEpisodes[offlineEpId].videoStatus ==
        offlineDownloadStatus.downloaded
      ) {
        offlineEps.push({
          ...this.props.episodes[offlineEpId],
          showFaded: false,
        });
      }
    }
    for (offlineEpId in this.props.offlineEpisodes) {
      // Add downloading audio files
      if (
        this.props.offlineEpisodes[offlineEpId].videoStatus ==
        offlineDownloadStatus.downloading
      ) {
        offlineEps.push({
          ...this.props.episodes[offlineEpId],
          showFaded: true,
        });
      }
    }
    return offlineEps;
  };

  getEpisodeName(episode) {
    if (!episode) {
      return '';
    } else if (episode.name && episode.name.length > 15) {
      return episode.name.slice(0, 14) + '...';
    }
    return episode.name;
  }

  getEpisodeSeriesName(episode) {
    if (!episode) {
      return '';
    }
    let series = this.props.channelsById[episode.show_id];
    if (!series) {
      return;
    }
    let seriesName = series.title;
    if (seriesName.length > 15) {
      return seriesName.slice(0, 14) + '...';
    }
    return seriesName;
  }

  renderEpisode({item, index}, title) {
    let opacity = item.showFaded ? 0.25 : 1;
    return (
      <TouchableOpacity
        style={[styles.episodeContainer, {opacity}]}
        onPress={() => {
          this.props.setValue('episodeContext', title.toLowerCase());
          this.props.setValue('episodeContextIndex', index);
          this.goToEpisode(item);
        }}>
        <Image
          style={styles.episodeImage}
          source={{uri: item && item.thumbnailUrl}}
        />
        <Text style={styles.episodeName}>{this.getEpisodeName(item)}</Text>
        <Text style={styles.seriesName}>{this.getEpisodeSeriesName(item)}</Text>
      </TouchableOpacity>
    );
  }

  emptyMessages = {
    offline: 'No downloaded items',
    favorites: 'No favorited items',
    playlist: 'No items in playlist',
  };

  renderList(title, data, dest) {
    let listNotEmpty = data && data.length && data.length > 0;
    return (
      <View
        style={listNotEmpty ? styles.listContainer : styles.emptyListContainer}>
        <TouchableOpacity
          style={{marginLeft: 10}}
          onPress={() => this.goToPage(dest)}>
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
        {listNotEmpty ? (
          <FlatList
            data={
              data &&
              data.filter(x => {
                return !!x;
              })
            }
            renderItem={({item, index}) => {
              return this.renderEpisode({item, index}, title);
            }}
            keyExtractor={(item, index) => {
              return index;
            }}
            horizontal={true}
          />
        ) : (
          <Text style={styles.emptyListText}>{this.emptyMessages[dest]}</Text>
        )}
      </View>
    );
  }

  render() {
    return (
      <Base hideBackButton={true} navigation={this.props.navigation}>
        <ScrollView>
          {this.renderList(
            'Offline Audio',
            this.getOfflineEpisodes(),
            'offline',
          )}
          {this.renderList('Offline Video', this.getOfflineVideos(), 'offline')}
          {this.renderList('Favorites', this.state.faves, 'favorites')}
          {this.renderList('Playlist', this.props.playlist, 'playlist')}
        </ScrollView>
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    isGettingFavorites: state.data.isGettingFavorites,
    favoriteEpisodes: state.data.favoriteEpisodes,
    offlineEpisodes: state.data.offlineEpisodes,
    episodes: state.data.episodes,
    user_id: state.auth.user_id,
    channelsById: state.data.channelsById,
    playlist: state.data.playlist,
    guest: state.auth.guest,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      navigateTo,
      logOut,
      getFavorites,
      setValue,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Library);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  episodeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 200,
  },
  listContainer: {
    paddingHorizontal: 8,
    height: 250,
  },
  title: {
    fontSize: height <= 600 ? 36 : 48,
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    color: colors.yellow,
  },
  emptyListContainer: {
    paddingHorizontal: 8,
    height: 120,
  },
  emptyListText: {
    fontSize: 14,
    fontFamily: 'Avenir',
    color: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  episodeImage: {
    width: 126,
    height: 126,
    borderRadius: 10,
  },
  episodeName: {
    fontSize: 14,
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    color: colors.yellow,
    textAlign: 'center',
  },
  seriesName: {
    fontSize: 14,
    fontFamily: 'Avenir',
    color: colors.white,
    textAlign: 'center',
  },
});
