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
import {addFavorite, removeFavorite, getFavorites} from '../actions/data';
import EpisodeList from './episode_list';
import Base from './view_base';
import {getChannels, getEpisodes, setValue} from '../actions/data';
import {colors} from '../constants';

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // channel: '',
      // pageDict: {}
    };
  }

  componentWillMount() {
    this.props.getFavorites(this.props.user_id);
    this.props.setValue('episodeContext', 'favorites');
  }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  render() {
    let episodes = [];
    for (let id in this.props.favoriteEpisodes) {
      if (this.props.episodes[id]) {
        episodes.push(this.props.episodes[id]);
      }
    }
    return (
      <Base header="Favorites" navigation={this.props.navigation}>
        <View style={styles.episodesContainer}>
          {episodes.length ? (
            <EpisodeList data={episodes} />
          ) : (
            <Text style={styles.emptyListText}>No favorited items!</Text>
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
    favoriteEpisodes: state.data.favoriteEpisodes,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getFavorites,
      removeFavorite,
      addFavorite,
      navigateTo,
      setValue,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Favorites);

const styles = StyleSheet.create({
  channelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodesContainer: {
    alignItems: 'center',
  },
  episodeRow: {
    flexDirection: 'row',
  },
  emptyListText: {
    fontSize: 14,
    fontFamily: 'Avenir',
    color: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
