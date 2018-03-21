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
    this.state = {recentEpisodes: []};
  }

  componentWillMount() {
    this.props.setValue('episodeContext', 'recent');
    this.props.setValue('series', {});
    this.setState({recentEpisodes: this.recentEpisodes(this.props)});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isSettingFavorites && !nextProps.isSettingFavorites) {
      this.setState({recentEpisodes: this.recentEpisodes(nextProps)});
    }
  }

  componentDidMount() {}

  recentEpisodes = props => {
    let episodes = props.recentEpisodeIds.map(x => {
      return props.episodes[x];
    });
    return episodes;
  };

  render() {
    return (
      <Base header="Recent Episodes" navigation={this.props.navigation}>
        <EpisodeList
          data={this.state.recentEpisodes}
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
    isSettingFavorites: state.data.isSettingFavorites,
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
