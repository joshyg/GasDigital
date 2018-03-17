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

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.setValue('episodeContext', 'recent');
  }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  recentEpisodes = () => {
    let episodes = this.props.recentEpisodeIds.map(x => {
      return this.props.episodes[x];
    });
    return episodes;
  };

  render() {
    return (
      <Base header="Recent Episodes" navigation={this.props.navigation}>
        <EpisodeList
          data={this.recentEpisodes()}
          contentContainerStyle={styles.channelsContainer}
          style={{opacity: 1}}
        />
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    recentEpisodeIds: state.data.recentEpisodeIds,
    channelsById: state.data.channelsById,
    episodes: state.data.episodes,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      resetTo,
      navigateTo,
      getChannels,
      getEpisodes,
      setValue,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

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
