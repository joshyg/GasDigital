import React from 'react';
import {Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import Base from './view_base';
import { search, setValue } from '../actions/data';
import _ from 'underscore';
import ListItemEpisode from './list_item_episode';
import { colors } from '../constants'; 
import Icon from 'react-native-vector-icons/FontAwesome';

class Search extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        textEmpty: true
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
      if ( text == '' ) {
        this.setState({textEmpty: true});
      } else if ( this.state.textEmpty ) {
        this.setState({textEmpty: false});
      }
    }

    render() {
      console.log('JG: this.state', this.state)
        return (
            <Base navigation={this.props.navigation}>
              <TextInput 
                style={styles.inputContainer}
                onChangeText={_.debounce(this.search, 300)}
                underlineColorAndroid={'transparent'}
                placeholder={'Search'}
                placeholderTextColor={colors.yellow}
                value={this.state.text} />
              <Text>{"\n"}</Text>
              { this.props.searchResults.length > 0 && !this.state.textEmpty ? (
                <View style={styles.episodesContainer}>
                  <FlatList
                    data={this.props.searchResults}
                    renderItem={this.renderEpisode.bind(this)}
                    keyExtractor={(item, index) => { return item.id }}
                    onEndReached={this.onEndReached.bind(this)}
                  /> 
                </View>
              ) : (
                <View style={styles.noResultsStyle}>
                  <Icon 
                    name={'search'}
                    size={120}
                    color={colors.yellow}
                  />
                  <Text>{"\n"}</Text>
                  <Text style={styles.header}>Search GaS Digital</Text>
                  <Text style={styles.subHeader}>Find your favorite episode, show, host or guest</Text>
                </View>
              )}

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
    marginTop: 25,
    paddingLeft: 10,
    paddingRight: 10,
    height: 36, 
    backgroundColor: colors.grey5,
    borderRadius: 10,
    color: colors.yellow,
  },
  noResultsStyle: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  episodesContainer: {
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 20,
    fontFamily: 'Avenir',
    color: colors.yellow,
    textAlign: 'center'
  },
  subHeader: {
    fontSize: 18,
    fontFamily: 'Avenir',
    color: colors.buttonGrey,
    textAlign: 'center'
  },
});
