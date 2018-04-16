import React from 'react';
import _ from 'lodash/fp';
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
import {togglePlayback} from '../actions/player';
import {
  getRSS,
  getEpisodes,
  setValue,
  getBonusContent,
  addFavorite,
  removeFavorite,
  addToPlaylist,
  removeFromPlaylist,
  getOfflineEpisode,
  deleteOfflineEpisode,
  displayOfflineEpisodeDownloading,
} from '../actions/data';
import EpisodeList from './episode_list';
import {EPISODES_PER_PAGE, offlineDownloadStatus, colors} from '../constants';
import {connectActionSheet} from '@expo/react-native-action-sheet';
import Base from './view_base';
const {height, width} = Dimensions.get('window');

@connectActionSheet
class Series extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      episodes: [],
      channel: '',
      bonusEpisodes: [],
      page: 1,
      bonusPage: 1,
      perpage: EPISODES_PER_PAGE,
      hasBonus: false,
      showBonus: false,
      showFullDescription: false,
    };
    this.fetchEpisodes = _.throttle(2000, this.fetchEpisodes);
    this.onEndReached = _.throttle(1000, this.onEndReached);
  }

  componentWillMount() {
    let series = this.props.series;
    if (!series) {
      return;
    }
    this.props.setValue('page', 1);
    this.props.setValue('bonusPage', 1);
    this.props.setValue('episodeContext', 'series');

    let channel = series.link.split('cat=')[1];
    this.setState({channel: channel});
    // if channel episodes not empty, throttle
    // requests to once per 30s on mount
    if (
      !this.props.channelEpisodeIds ||
      !this.props.channelEpisodeIds[channel] ||
      Date.now() / 1000 - this.props.lastChannelFetchTime[channel] > 30
    ) {
      this.fetchEpisodes(this.props, channel, series.id);
    } else if (
      this.props.channelEpisodeIds &&
      this.props.channelEpisodeIds[channel]
    ) {
      let page = parseInt(
        this.props.channelEpisodeIds[channel].length / this.state.perpage,
      );
      this.setState({page});
    }
    this.updateEpisodes(this.props, channel);
  }

  updateEpisodes(props, channel) {
    // set initial episode list
    if (props.channelEpisodeIds && props.channelEpisodeIds[channel]) {
      let channelEpisodes = props.channelEpisodeIds[channel].map(x => {
        return props.episodes[x];
      });
      this.setState({episodes: channelEpisodes});
    }
    // bonus episodes
    if (props.channelBonusEpisodeIds && props.channelBonusEpisodeIds[channel]) {
      let bonusEpisodes = props.channelBonusEpisodeIds[channel].map(x => {
        return props.episodes[x];
      });
      this.setState({hasBonus: true, bonusEpisodes: bonusEpisodes});
    }
  }

  fetchEpisodes(props, channel, series_id, page = 1) {
    const {series} = this.props;
    if (this.props.guest && series && series.id && series.rss_feed) {
      if (page == 1) {
        props.setValue('isGettingEpisodes', true);
        this.props.getRSS(channel, this.props.series.rss_feed);
      }
      return;
    }
    props.setValue('isGettingEpisodes', true);
    props.setValue('isGettingBonusEpisodes', true);
    props.getEpisodes(channel, series_id, this.props.user_id, page);
    props.getBonusContent(channel, series_id, page);
  }

  componentWillReceiveProps(nextProps) {
    if (
      (this.props.isGettingEpisodes && !nextProps.isGettingEpisodes) ||
      (this.props.isGettingBonusEpisodes &&
        !nextProps.isGettingBonusEpisodes) ||
      this.props.page != nextProps.page
    ) {
      let series = this.props.series;
      if (!series) {
        return;
      }
      let channel = series.link.split('cat=')[1];
      this.setState({channel: channel});
      if (nextProps.channelEpisodeIds[channel]) {
        let channelEpisodes = nextProps.channelEpisodeIds[channel].map(x => {
          return nextProps.episodes[x];
        });
        this.setState({episodes: channelEpisodes});
      } else {
        this.fetchEpisodes(nextProps, this.state.channel, series.id);
      }

      if (
        nextProps.channelBonusEpisodeIds &&
        nextProps.channelBonusEpisodeIds[channel]
      ) {
        let bonusEpisodes = nextProps.channelBonusEpisodeIds[channel].map(x => {
          return nextProps.episodes[x];
        });
        this.setState({hasBonus: true, bonusEpisodes: bonusEpisodes});
      }
    }
    if (this.props.isSettingFavorites && !nextProps.isSettingFavorites) {
      let series = nextProps.series;
      if (series) {
        let channel = series.link.split('cat=')[1];
        this.updateEpisodes(nextProps, channel);
      }
    }
  }

  componentDidMount() {}

  onEndReached = ({distanceFromEnd}) => {
    let channel = this.state.channel;
    if (!this.state.showBonus) {
      let pageNum = 1;
      if (this.state.episodes && this.state.episodes.length) {
        pageNum =
          1 + Math.floor(this.state.episodes.length / EPISODES_PER_PAGE);
      }
      this.setState({page: pageNum});
      if (!this.props.guest) {
        let series_id = (this.props.series && this.props.series.id) || '';
        this.props.setValue('isGettingEpisodes', true);
        this.props.getEpisodes(channel, series_id, this.props.user_id, pageNum);
      }
    } else {
      let pageNum = 1;
      if (this.state.bonusEpisodes && this.state.bonusEpisodes.length) {
        pageNum =
          1 + Math.floor(this.state.bonusEpisodes.length / EPISODES_PER_PAGE);
      }
      this.setState({bonusPage: pageNum});
      if (!this.props.guest) {
        let series_id = (this.props.series && this.props.series.id) || '';
        this.props.setValue('isGettingBonusEpisodes', true);
        this.props.getBonusContent(channel, series_id, pageNum);
      }
    }
  };

  showFullDescription = () => {
    this.setState({showFullDescription: true});
  };

  renderDescription() {
    let series = this.props.series;
    if (!series || !series.desc) {
      return null;
    }
    let description = this.state.showFullDescription
      ? series.desc
      : series.desc.slice(0, 240);
    if (!this.state.showFullDescription && series.desc.length > 240) {
      return (
        <View style={{marginBottom: 30}}>
          <Text style={styles.description}>{description + '...'}</Text>
          <TouchableOpacity onPress={this.showFullDescription}>
            <Text style={[styles.description, {color: colors.yellow}]}>
              More
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{marginBottom: 30}}>
        <Text style={styles.description}>{description}</Text>
      </View>
    );
  }

  renderHeader = () => {
    let series = this.props.series;
    return (
      <View style={styles.container}>
        <Image
          style={styles.thumbnail}
          source={{uri: series && series.thumb}}
        />

        {this.state.hasBonus && (
          <View style={styles.showBonusToggle}>
            <TouchableOpacity
              style={[
                this.state.showBonus ? styles.unselected : styles.selected,
              ]}
              onPress={() => {
                this.setState({showBonus: false});
              }}>
              <Text
                style={
                  this.state.showBonus
                    ? {color: colors.white}
                    : {color: colors.blue}
                }>
                Recent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                !this.state.showBonus ? styles.unselected : styles.selected,
              ]}
              onPress={() => {
                this.setState({showBonus: true});
              }}>
              <Text
                style={
                  this.state.showBonus
                    ? {color: colors.blue}
                    : {color: colors.white}
                }>
                Bonus Content
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {this.renderDescription()}
      </View>
    );
  };

  render() {
    return (
      <Base header={this.state.channel} navigation={this.props.navigation}>
        <EpisodeList
          data={
            this.state.showBonus
              ? this.state.bonusEpisodes
              : this.state.episodes
          }
          contentContainerStyle={styles.container}
          onEndReached={x => {
            this.onEndReached(x);
          }}
          onEndReachedThreshold={2}
          renderHeader={this.renderHeader}
        />
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    guest: state.auth.guest,
    episode: state.data.episode,
    series: state.data.series,
    channels: state.data.channels,
    episodes: state.data.episodes,
    channelEpisodeIds: state.data.channelEpisodeIds,
    isGettingEpisodes: state.data.isGettingEpisodes,
    isGettingBonusEpisodes: state.data.isGettingBonusEpisodes,
    channelBonusEpisodeIds: state.data.channelBonusEpisodeIds,
    lastChannelFetchTime: state.data.lastChannelFetchTime,
    page: state.data.page,
    offlineEpisodes: state.data.offlineEpisodes,
    favoriteEpisodes: state.data.favoriteEpisodes,
    isSettingFavorites: state.data.isSettingFavorites,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      resetTo,
      navigateTo,
      setValue,
      togglePlayback,
      getEpisodes,
      setValue,
      getBonusContent,
      getRSS,
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

export default connect(mapStateToProps, mapDispatchToProps)(Series);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  thumbnail: {
    height: 150,
    width: 150,
    paddingBottom: 10,
    marginBottom: 10,
    borderRadius: 15,
  },
  description: {
    fontSize: 13,
    paddingLeft: 5,
    paddingRight: 5,
    color: colors.white,
    fontFamily: 'Avenir',
    textAlign: 'justify',
  },
  selected: {
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.yellow,
    width: height <= 600 ? 130 : 164,
    height: 40,
    justifyContent: 'center',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 10,
  },
  unselected: {
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.buttonGrey,
    width: height <= 600 ? 130 : 164,
    height: 40,
    justifyContent: 'center',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },

  showBonusToggle: {
    flexDirection: 'row',
    marginBottom: 15,
  },
});
