import React from 'react';
import {Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import Base from './view_base';
import { search, setValue } from '../actions/data';
import _ from 'underscore';
import ListItemEpisode from './list_item_episode';

class Search extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        
      }
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {

    }

    onEndReached() {
      // When you get to the end of the list, load more
      // "I would use state for this, not the whole action flow thing"

      // let channel = this.state.channel;
      // let pageNum = this.state.pageDict[channel]+1;
      // let channelPage = {}
      // channelPage[channel] = pageNum;
      // this.setState({pageDict: { ...this.state.pageDict, ...channelPage}});
    }

    goToEpisode(item) {
      this.props.setValue('episode',item);
      this.props.navigateTo('episode');
    }

    renderEpisode = ({item}) => {
      let episode = this.props.episodes[item];
      if ( ! episode ) {
        return null;
      }
      return (
        <ListItemEpisode item={episode} goToEpisode={() => {this.goToEpisode(episode)}}/>
      );
    }

    search = (text) => {
      let endState = {}
      this.props.search(text, this.props.user_id)
    }

    render() {
      console.log('JG: this.state', this.state)
        return (
            <Base navigation={this.props.navigation}>
              <TextInput 
                style={styles.inputContainer}
                onChangeText={_.debounce(this.search, 300)}
                underlineColorAndroid={'transparent'}
                value={this.state.text} />
              <Text>{"\n"}</Text>
              <View style={styles.episodesContainer}>
                <FlatList
                  data={this.props.searchResults}
                  renderItem={this.renderEpisode.bind(this)}
                  keyExtractor={(item, index) => { return item.id }}
                  onEndReached={this.onEndReached.bind(this)}
                />
              </View>
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      user_id: state.auth.user_id,
      searchResults: state.data.searchResults,
      channels: state.data.channels,
      channelEpisodeIds: state.data.channelEpisodeIds,
      isGettingEpisodes: state.data.isGettingEpisodes,
      episodes: state.data.episodes
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        setValue,
        search,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);

const styles = StyleSheet.create({
  inputContainer: {
    margin: 10,
    paddingLeft: 10,
    paddingRight: 10,
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1,
  },
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
