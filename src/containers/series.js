import React from 'react';
import _ from 'lodash/fp';
import { Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import { togglePlayback } from '../actions/player';
import {  
  getRSS, 
  getEpisodes,
  setValue,
  getBonusContent ,
  addFavorite,
  removeFavorite,
  addToPlaylist,
  removeFromPlaylist,
  getOfflineEpisode,
  deleteOfflineEpisode,
  displayOfflineEpisodeDownloading,
} from '../actions/data';
import ListItemEpisode from './list_item_episode';
import { EPISODES_PER_PAGE, offlineDownloadStatus, colors } from '../constants';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import Base from './view_base';

@connectActionSheet
class Series extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        episodes: [],
        channel: '',
        bonusEpisodes: [],
        page:1,
        perpage:EPISODES_PER_PAGE,
        hasBonus: false,
        showBonus: false,
        showFullDescription: false,
      }
      this.goToEpisode = this.goToEpisode.bind(this);
      this.fetchEpisodes = _.throttle(2000,this.fetchEpisodes);
      this.onEndReached = _.throttle(1000,this.onEndReached);
    }


    componentWillMount(){
      let series = this.props.series;
      if(!series){return}
      this.props.setValue('page', 1);

      let channel = series.link.split('cat=')[1];
      this.setState({channel:channel});
      // if channel episodes not empty, throttle 
      // requests to once per 5 min on mount
      if ( ! this.props.channelEpisodeIds || 
           ! this.props.channelEpisodeIds[channel] ||
           Date.now()/1000 - this.props.lastChannelFetchTime[channel] > 30 ) {
        this.fetchEpisodes(this.props,channel);
      } else if ( this.props.channelEpisodeIds && this.props.channelEpisodeIds[channel] ) {
        let page = parseInt(this.props.channelEpisodeIds[channel].length/this.state.perpage);
        this.setState({page});
      }
      this.updateEpisodes(this.props, channel);
    }

    updateEpisodes(props, channel) {
      // set initial episode list
      if ( props.channelEpisodeIds && props.channelEpisodeIds[channel] ) {
        let channelEpisodes = props.channelEpisodeIds[channel].map(x => { return props.episodes[x] });
        this.setState({episodes:channelEpisodes});
      } 
      // bonus episodes
      if(props.channelBonusEpisodeIds && props.channelBonusEpisodeIds[channel] ){
          let bonusEpisodes = props.channelBonusEpisodeIds[channel].map(x => { return props.episodes[x] });
          this.setState({hasBonus: true, bonusEpisodes:  bonusEpisodes})
      }
    }

    fetchEpisodes(props,channel,page=1) {
      const { series } = this.props;
      if ( this.props.guest && 
           series && 
           series.id && 
           series.rss_feed ) {
        if ( page == 1 ) {
          props.setValue('isGettingEpisodes', true);
          this.props.getRSS( channel, this.props.series.rss_feed );
        }
        return;
      }
      props.setValue('isGettingEpisodes', true);
      props.getEpisodes(channel,this.props.user_id,page);
      props.getBonusContent(channel);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.isGettingEpisodes && ! nextProps.isGettingEpisodes ||
          this.props.page != nextProps.page) {
        let series = this.props.series;
        if(!series){return}
        let channel = series.link.split('cat=')[1];
        this.props.getBonusContent(channel);
        this.setState({channel:channel});
        if ( nextProps.channelEpisodeIds[channel] ) { 
          let channelEpisodes = nextProps.channelEpisodeIds[channel].map(x => { return nextProps.episodes[x] });
          this.setState({episodes:channelEpisodes});
        } else {
          this.fetchEpisodes(nextProps,this.state.channel);
        }

        if(nextProps.channelBonusEpisodeIds && nextProps.channelBonusEpisodeIds[channel] ){
            let bonusEpisodes = nextProps.channelBonusEpisodeIds[channel].map(x => { return nextProps.episodes[x] });
            this.setState({hasBonus: true, bonusEpisodes:  bonusEpisodes})
        }

      }
      if ( this.props.isSettingFavorites && ! nextProps.isSettingFavorites ) {
        let series = nextProps.series;
        if(series){
          let channel = series.link.split('cat=')[1];
          this.updateEpisodes(nextProps, channel);
        }
      }

    }

    componentDidMount() {
    }



    onEndReached = ({distanceFromEnd}) => {
      let channel = this.state.channel;
      let pageNum = 1;
      if ( this.state.episodes && this.state.episodes.length ) {
        pageNum = 1 + Math.floor(this.state.episodes.length / EPISODES_PER_PAGE);
      }
      console.log('JG: onEndReached page/props.page = ',pageNum,this.props.page, " distance from end = ", distanceFromEnd );
      this.setState({page:pageNum});
      if ( ! this.props.guest ) {
        this.props.setValue('isGettingEpisodes', true);
        this.props.getEpisodes(channel,this.props.user_id,pageNum);
      }
    }


    goToEpisode(item) {
      this.props.setValue('episode',item);
      this.props.navigateTo('episode');
    }

    showFullDescription = () => {
      this.setState({showFullDescription: true});
    }

    renderDescription() {
      let series = this.props.series;
      if ( ! series || ! series.desc ) {
        return null;
      }
      let description = this.state.showFullDescription ? 
        series.desc :
        series.desc.slice(0,240);
      if ( ! this.state.showFullDescription && series.desc.length > 240 ) {
         return (
            <View style={{marginBottom: 30}}>
              <Text style={styles.description}>{description+'...'}</Text>
              <TouchableOpacity onPress={this.showFullDescription}>
                <Text style={[styles.description, { color: colors.yellow }]} >More</Text>
              </TouchableOpacity>
            </View>
          );
       }
       return ( 
         <View style={{marginBottom: 30}}>
           <Text style={styles.description}>{description}</Text>
         </View>
       )
    }

    renderHeader = () => {
      let series = this.props.series;
      return (
        <View style={styles.container}>
        <Image 
          style={styles.thumbnail}
          source={{uri: series && series.thumb}}
        />

        { this.state.hasBonus && (

        <View style={styles.showBonusToggle}>
          <TouchableOpacity
            style={[this.state.showBonus ? styles.unselected : styles.selected]} 
            onPress={()=>{this.setState({showBonus: false})}}
          >
            <Text style={this.state.showBonus ? {color: colors.white}  : {color: colors.blue}}>Recent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[!this.state.showBonus ? styles.unselected : styles.selected]} 
            onPress={()=>{this.setState({showBonus: true})}}
          >
            <Text style={this.state.showBonus ?  {color: colors.blue} : {color: colors.white}}>Bonus Content</Text>
          </TouchableOpacity>
        </View>
        )}
        {this.renderDescription()}
        </View>
      );
    }

    downloadOfflineEpisode = (episode,type) => {
      // Immediately shows episode as downloading
      this.props.displayOfflineEpisodeDownloading(episode, type); 

      // Starts downloading, and when promise is finished, 
      // shows episode is finished downloading
      this.props.getOfflineEpisode(episode, type); 
    }

    downloadOfflineAudio = episode => {
      this.downloadOfflineEpisode(episode,'audio');
    }

    downloadOfflineVideo = episode => {
      this.downloadOfflineEpisode(episode,'video');
    }

    deleteOfflineEpisode = (episode,type) => {
      if ( this.props.isPlaying && 
        this.props.currentTrack.episode_id == episode.id ) {
        Alert.alert( 'Forbidden', 'Cant delete download of currently playing track' );
        return;
      }
      let url;
      if ( type == 'audio' ) {
        url = this.props.offlineEpisodes[episode.id] && 
              this.props.offlineEpisodes[episode.id].audioUrl;
      } else {
        url = this.props.offlineEpisodes[episode.id] && 
              this.props.offlineEpisodes[episode.id].videoUrl;
      }
      this.props.deleteOfflineEpisode(
        episode, 
        url,
        type
      );
    }

    deleteOfflineAudio = (episode) => {
      this.deleteOfflineEpisode(episode,'audio');
    }

    deleteOfflineVideo = (episode) => {
      this.deleteOfflineEpisode(episode,'video');
    }

    removeFavorite = (episode) => {
      this.props.setValue('isSettingFavorites', true);
      this.props.removeFavorite(
        this.props.user_id, 
        episode.id,
        episode.id,
      )
    }

    addFavorite = (episode) => {
      console.log('JG: add favorite episode = ', episode);
      this.props.setValue('isSettingFavorites', true);
      this.props.addFavorite(
        this.props.user_id, 
        episode.id,
        episode.id,
        episode
      )
    }

    audioDownloaded = (episode) => {
      let audioDownloadingState = offlineDownloadStatus.notDownloaded;
      if (!!this.props.offlineEpisodes[episode.id] && 
          !!this.props.offlineEpisodes[episode.id].status) {
        audioDownloadingState = this.props.offlineEpisodes[episode.id].status;
      }
      return audioDownloadingState == offlineDownloadStatus.downloaded;
    }

    episodeFavorited = (episode) => {
      return episode.is_favourite || this.props.favoriteEpisodes[episode.id];
    }

    showActionSheetWithOptions = (item) => {
      let options = [];
      let actions = [];
      if ( this.audioDownloaded(item) ) {
        options.push('Remove Audio Download');
        actions.push(this.deleteOfflineAudio);
      } else {
        options.push('Download Audio');
        actions.push(this.downloadOfflineAudio);
      }
      if ( this.episodeFavorited(item) ) {
        options.push('Unfavorite');
        actions.push(this.removeFavorite);
      } else {
        options.push('Favorite');
        actions.push(this.addFavorite);
      }
      options.push('Cancel');
      actions.push(()=>{});
      this.props.showActionSheetWithOptions({
        options,
        cancelButtonIndex:options.length-1
      },
      buttonIndex => { 
        actions[buttonIndex](item);
      });
    }

    renderEpisode({item,index}) {
      return (
        <View>
        { index == 0 && this.renderHeader() }
        <ListItemEpisode 
          item={item} 
          showActionSheetWithOptions={() => {this.showActionSheetWithOptions(item)}}
          goToEpisode={() => {this.goToEpisode(item)}}/>
        </View>
      );
    }

    render() {
        const { height, width } = Dimensions.get('window');
        return (
            <Base navigation={this.props.navigation}>
              <FlatList
                contentContainerStyle={styles.container}
                data={this.state.showBonus ? this.state.bonusEpisodes : this.state.episodes }
                renderItem={this.renderEpisode.bind(this)}
                keyExtractor={(item, index) => { return item.id + index }}
                onEndReached={(x) => {this.onEndReached(x)}}
                onEndReachedThreshold={2}
              />
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
      user_id: state.auth.user_id,
      guest: state.auth.guest,
      episode: state.data.episode,
      series: state.data.series,
      channels: state.data.channels,
      episodes: state.data.episodes,
      channelEpisodeIds: state.data.channelEpisodeIds,
      isGettingEpisodes: state.data.isGettingEpisodes,
      channelBonusEpisodeIds: state.data.channelBonusEpisodeIds,
      lastChannelFetchTime: state.data.lastChannelFetchTime,
      page: state.data.page,
      offlineEpisodes: state.data.offlineEpisodes,
      favoriteEpisodes: state.data.favoriteEpisodes,
      isSettingFavorites: state.data.isSettingFavorites
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        setValue,
        togglePlayback,
        getEpisodes,
        setValue,
        getBonusContent,
        getRSS,
        addFavorite,
        removeFavorite,
        addToPlaylist,
        removeFromPlaylist,
        getOfflineEpisode,
        deleteOfflineEpisode,
        displayOfflineEpisodeDownloading,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Series);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    height: 150,
    width: 150,
    paddingBottom: 10,
    marginBottom: 10,
    borderRadius: 15
  },
  description: {
    fontSize: 13,
    paddingLeft: 5,
    paddingRight: 5,
    color: colors.white,
    fontFamily: 'Avenir'
  },
    selected: {
      marginTop: 0,
      marginBottom: 0,
      marginHorizontal: 5,
      borderRadius: 10,
      backgroundColor:  colors.yellow,
      width: 164,
      height: 40,
      justifyContent: 'center',
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'row',
      borderRadius: 10,
  },
  unselected: {
      marginTop: 0,
      marginBottom: 0,
      marginHorizontal: 5,
      borderRadius: 10,
      backgroundColor: colors.buttonGrey,
      width: 164,
      height: 40,
      justifyContent: 'center',
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'row',
  },

  showBonusToggle: {
    flexDirection: 'row',
    marginBottom: 15,
  }
});
