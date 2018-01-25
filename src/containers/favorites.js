import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import { addFavorite, removeFavorite, getFavorites } from '../actions/data';
import ListItemEpisode from './list_item_episode';
import Base from './view_base';
import { getChannels, getEpisodes, setValue } from '../actions/data';

class Favorites extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        // channel: '',
        // pageDict: {}
      }
    }

    componentWillMount(){
      this.props.getFavorites(this.props.user_id);
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {

    }

    goToEpisode = (item) => {
      this.props.setValue('episode',item);
      this.props.navigateTo('episode');
    }

    onEndReached() {
      // let channel = this.state.channel;
      // let pageNum = this.state.pageDict[channel]+1;
      // let channelPage = {}
      // channelPage[channel] = pageNum;
      // this.setState({pageDict: { ...this.state.pageDict, ...channelPage}});
      // this.props.setValue('isGettingEpisodes', true);
      // this.props.getEpisodes(channel,this.props.user_id,pageNum);
    }

    renderEpisode({item}) {
        return (
        	<ListItemEpisode item={item}
        		goToEpisode={this.goToEpisode}/>
        );
    }

    render() {
      let faves = [];
      for (ep in this.props.episodes) {
        if (this.props.episodes[ep].is_favourite) {
          faves.push(this.props.episodes[ep]);
        }
      }
      return (
        <Base navigation={this.props.navigation}>
          <View style={styles.episodesContainer}>
            <Text style={styles.title}>Favorites</Text>
            <FlatList
              data={faves}
              renderItem={this.renderEpisode.bind(this)}
              keyExtractor={(item, index) => { return index }}
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
	    episodes: state.data.episodes,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getFavorites,
        removeFavorite,
        addFavorite,
        navigateTo,
        setValue
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Favorites);

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
  title: {
      fontSize: 30,
      color: 'black',
      textAlign: 'left',
      paddingLeft: 20,
      marginBottom: 20,
  },
});
