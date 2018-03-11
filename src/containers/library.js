import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import Base from './view_base';
import { getChannels, getFavorites, getEpisodes, setValue } from '../actions/data';
import { logOut } from '../actions/auth';
import { colors, offlineDownloadStatus } from '../constants';

class Library extends React.Component {
    componentWillMount(){
      this.props.setValue('isGettingFavorites', true);
      this.props.getFavorites(this.props.user_id);
      this.setState({
        faves: this.getFaves()
      });
    }
    getFaves() {
      let faves = [];
      for (ep in this.props.favoriteEpisodes) {
        let episode = this.props.favoriteEpisodes[ep];
        if ( episode ) {
          faves.push(episode);
        }
      }
      return faves;
    }

    componentWillReceiveProps(nextProps) {
      if ( this.props.isGettingFavorites && ! nextProps.isGettingFavorites ) {
        this.setState({faves: this.getFaves()});
      }
    }

    goToPage(item) {
      this.props.navigateTo(item);
    }

    goToEpisode = (item) => {
      this.props.setValue('episode',item);
      this.props.navigateTo('episode');
    }


    getOfflineEpisodes = () => {
      let flatListItems = [];
      let offlineEps = [];
      for (offlineEpId in this.props.offlineEpisodes) {
        // Add downloading audio files
        if (this.props.offlineEpisodes[offlineEpId].status == offlineDownloadStatus.downloaded) {
          offlineEps.push(this.props.episodes[offlineEpId]);
        }

        // Add downloading video files
        /*
        if (this.props.offlineEpisodes[offlineEpId].videoStatus == offlineDownloadStatus.downloaded) {
          offlineEps.push(this.props.episodes[offlineEpId]);
        }
        */
      }
      return offlineEps;
    }

    renderEpisode({item}, spinny) {
      return (
  		  <TouchableOpacity   
        style={styles.container}
        onPress={()=>{this.goToEpisode(item)}}>
          <Image 
            style={styles.episodeImage}
            source={{uri: item && item.thumbnailUrl}}/>
        </TouchableOpacity>
      );
    } 

    render() {
        return (
            <Base navigation={this.props.navigation}>
              <View style={styles.container}>
                <Text style={styles.title}>Favorites</Text>
                <FlatList
                  data={this.state.faves}
                  renderItem={this.renderEpisode.bind(this)}
                  keyExtractor={(item, index) => { return index }}
                  horizontal={true}
                />

                {/*
                <TouchableOpacity 
                  onPress={()=>{this.goToPage('playlist')}}>
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.title}>Playlist</Text>
                  </View>
                </TouchableOpacity>
                */}

                <Text style={styles.title}>Offline</Text>
                <FlatList
                  data={this.getOfflineEpisodes()}
                  renderItem={this.renderEpisode.bind(this)}
                  keyExtractor={(item, index) => { return index }}
                  horizontal={true}
                />
              </View>
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      isGettingFavorites: state.data.isGettingFavorites,
      favoriteEpisodes: state.data.favoriteEpisodes,
      offlineEpisodes: state.data.offlineEpisodes,
      episodes: state.data.episodes,
      user_id: state.auth.user_id,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        navigateTo,
        logOut,
        getFavorites,
        setValue
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Library);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 48,
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    color: colors.yellow
  },
  episodeImage: {
    width: 126,
    height: 126,
    borderRadius: 5
  },
});
