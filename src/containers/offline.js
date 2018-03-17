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
import EpisodeList from './episode_list';
import Base from './view_base';
import {getChannels, getEpisodes, setValue} from '../actions/data';
import {offlineDownloadStatus} from '../constants';

class Offline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // channel: '',
      // pageDict: {}
    };
  }

  componentWillMount() {
    this.props.setValue('episodeContext', 'offline');
  }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  render() {
    let flatListItems = [];
    let offlineEps = [];
    let downloadingOfflineEps = [];
    for (offlineEpId in this.props.offlineEpisodes) {
      // Add downloading audio files
      switch (this.props.offlineEpisodes[offlineEpId].status) {
        case offlineDownloadStatus.downloading:
          downloadingOfflineEps.push(this.props.episodes[offlineEpId]);
          break;
        case offlineDownloadStatus.downloaded:
          offlineEps.push(this.props.episodes[offlineEpId]);
          break;
      }

      // Add downloading video files
      switch (this.props.offlineEpisodes[offlineEpId].videoStatus) {
        case offlineDownloadStatus.downloading:
          downloadingOfflineEps.push(this.props.episodes[offlineEpId]);
          break;
        case offlineDownloadStatus.downloaded:
          offlineEps.push(this.props.episodes[offlineEpId]);
          break;
      }
    }

    if (!!offlineEps.length) {
      let uniqueOfflineEpisodes = offlineEps;
      // let uniqueOfflineEpisodes = _.uniq(offlineEps);
      for (let i = 0; i < uniqueOfflineEpisodes.length; i++) {
        flatListItems.push(uniqueOfflineEpisodes[i]);
      }
    }
    if (!!downloadingOfflineEps.length) {
      let uniqueDownloadingEpisodes = downloadingOfflineEps;
      // let uniqueDownloadingEpisodes = _.uniq(downloadingOfflineEps);
      for (let i = 0; i < uniqueDownloadingEpisodes.length; i++) {
        flatListItems.push({
          ...uniqueDownloadingEpisodes[i],
          spinny: true,
        });
      }
    }
    return (
      <Base header="Offline" navigation={this.props.navigation}>
        <View style={styles.episodesContainer}>
          {!!flatListItems.length ? (
            <EpisodeList data={flatListItems} />
          ) : (
            <Text>No offline content!</Text>
          )}
        </View>
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    episodes: state.data.episodes,
    offlineEpisodes: state.data.offlineEpisodes,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      navigateTo,
      setValue,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Offline);

const styles = StyleSheet.create({
  channelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodesContainer: {
    alignItems: 'flex-start',
  },
  episodeRow: {
    flexDirection: 'row',
  },
});
