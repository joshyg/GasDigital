import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import ListItemEpisode from './list_item_episode';
import Base from './view_base';
import { getChannels, getEpisodes, setValue } from '../actions/data';

class Home extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      }
    }

    componentWillMount(){
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {

    }

    onEndReached() {
    }

    goToEpisode = (item) => {
      let channel = this.props.channelsById[item.show_id];
      this.props.setValue('episode',item);
      this.props.setValue('series',channel);
      this.props.navigateTo('episode');
    }

    renderEpisode = ({item}) => {
      return (
        <ListItemEpisode item={item} goToEpisode={this.goToEpisode}/>
      );
    }

    recentEpisodes = () => {
      let episodes = this.props.recentEpisodeIds.map(x => { return this.props.episodes[x] });
      return episodes;
    }

    render() {
        return (
            <Base navigation={this.props.navigation}>
              <View style={styles.channelsContainer}>
                <FlatList
                  data={this.recentEpisodes()}
                  renderItem={this.renderEpisode}
                  keyExtractor={(item, index) => { return item.id }}
                  horizontal={false}
                />
              </View>
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      user_id: state.auth.user_id,
      recentEpisodeIds: state.data.recentEpisodeIds,
      channelsById: state.data.channelsById,
      episodes: state.data.episodes
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        getChannels,
        getEpisodes,
        setValue
    }, dispatch);
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
    flexDirection: 'row'
  },
});
