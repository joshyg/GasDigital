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
import ListItemEpisode from './list_item_episode';
import {getChannels, getEpisodes, setValue} from '../actions/data';
import {colors, offlineDownloadStatus} from '../constants';

class EpisodeList extends React.Component {
  componentWillMount() {}

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  goToEpisode = (item, index) => {
    if (item && item.show_id && this.props.channelsById[item.show_id]) {
      let channel = this.props.channelsById[item.show_id];
    }
    this.props.setValue('episodeContextIndex', index);
    this.props.setValue('episode', item);
    this.props.navigateTo('episode');
  };

  renderEpisode({item, index}) {
    return (
      <View>
        {index == 0 && this.props.renderHeader && this.props.renderHeader()}
        <ListItemEpisode
          item={item}
          goToEpisode={() => this.goToEpisode(item, index)}
          spinny={!!item.spinny}
        />
      </View>
    );
  }

  render() {
    const {props} = this;
    return (
      <FlatList
        data={this.props.data}
        renderItem={this.renderEpisode.bind(this)}
        keyExtractor={(item, index) => {
          return index;
        }}
        horizontal={false}
        {...props}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    channelsById: state.data.channelsById,
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

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeList);

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
