import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import { removeFromPlaylist } from '../actions/data';
import ListItemEpisode from './list_item_episode';
import Base from './view_base';
import { getChannels, getEpisodes, setValue } from '../actions/data';
import { setPlayerValue, fetchAndPlayAudio } from '../actions/player';
import { colors } from '../constants.js';


class Playlist extends React.Component {
    constructor(props) {
      super(props);
      this.state = {

      }

      this.goToEpisode = this.goToEpisode.bind(this);
      this.playAll = this.playAll.bind(this)
    }

    componentWillMount(){
    }

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {

    }


    playAll(){
      this.props.setPlayerValue('queue',this.props.playlist);
      this.props.setPlayerValue('queueIndex', 0);

      let episode = this.props.playlist[0];
      console.log("EJ::",episode)
      let track = {
        uri: episode.dataUrl,
        download_uri: episode.downloadUrl,
        image: episode.thumbnailUrl,
        name: episode.name,
        episode_id: episode.id,
        series_id: episode.show_id,
        audioUrl: episode.audioUrl
      }
      console.log('JG: setting track to ', track);
      this.props.setPlayerValue('isPlayingVideo', false);
      this.props.setPlayerValue('videoMode', false);

      this.props.setPlayerValue('currentTrack', track);
      if ( ! track.audioUrl ) {
        this.props.fetchAndPlayAudio( episode.show_id, episode.id);
      } else {
        this.props.setPlayerValue('isPlaying', true);
      }
    }

    removeFromPlaylist(item){
      this.props.removeFromPlaylist(item);
    }

    goToEpisode(item) {
    	console.log('JG: going to episode', item );
    	this.props.setValue('episode',item);
    	this.props.navigateTo('episode');
    }

    renderEpisode({item}) {
        return (
        	<ListItemEpisode item={item}
        		goToEpisode={this.goToEpisode}
            playlistView={true}
            removeFromPlaylist={()=>{this.props.removeFromPlaylist(item)}}
            />
        );
    }

    render() {
      return (
        <Base navigation={this.props.navigation}>
          <View style={{alignItems: 'center'}}>
            {this.props.playlist && this.props.playlist.length > 0  ? (
            <TouchableOpacity style={styles.button} onPress={this.playAll}>
              <Image style={[styles.iconMarginRight]} source={require('../../assets/icons/play-audio.png')}/>
              <Text>Play All</Text>
            </TouchableOpacity>
            ) : (<Text>Playlist empty!</Text>)}
            <FlatList
              data={this.props.playlist}
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
	    playlist: state.data.playlist
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        removeFromPlaylist,
        navigateTo,
        setValue,
        setPlayerValue,
        fetchAndPlayAudio,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: 'black',
    textAlign: 'left',
    paddingLeft: 20,
    marginBottom: 20,
  },
    iconMarginRight: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginRight: 20,
  },
  button: {
      marginTop: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.yellow,
      backgroundColor: colors.yellow,
      width: 170,
      height: 45,
      justifyContent: 'center',
      padding: 12,
      marginLeft: 15,
      marginRight: 15,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'row',
  },
});
