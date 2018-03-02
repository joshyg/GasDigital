import React from 'react';
import _ from 'lodash/fp';
import { Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import { togglePlayback } from '../actions/player';
import {  getRSS, getEpisodes,setValue, getBonusContent } from '../actions/data';
import ListItemEpisode from './list_item_episode';
import { EPISODES_PER_PAGE, colors } from '../constants';


import Base from './view_base';

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
      // set initial episode list
      if ( this.props.channelEpisodeIds && this.props.channelEpisodeIds[channel] ) {
        let channelEpisodes = this.props.channelEpisodeIds[channel].map(x => { return this.props.episodes[x] });
        this.setState({episodes:channelEpisodes});
      } 
      // bonus episodes
      if(this.props.channelBonusEpisodeIds && this.props.channelBonusEpisodeIds[channel] ){
          let bonusEpisodes = this.props.channelBonusEpisodeIds[channel].map(x => { return this.props.episodes[x] });
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
          console.log('JG: cwrp update episodes');
          this.setState({episodes:channelEpisodes});
        } else {
          console.log('JG: cwrp fetch episodes');
          this.fetchEpisodes(nextProps,this.state.channel);
        }

        if(nextProps.channelBonusEpisodeIds && nextProps.channelBonusEpisodeIds[channel] ){
            let bonusEpisodes = nextProps.channelBonusEpisodeIds[channel].map(x => { return nextProps.episodes[x] });
            this.setState({hasBonus: true, bonusEpisodes:  bonusEpisodes})
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
          <TouchableOpacity style={[styles.button, this.state.showBonus ? styles.unselected : styles.selected   ]} onPress={()=>{this.setState({showBonus: false})}}>
            <Text style={this.state.showBonus ? {color: 'black'}  : {color: colors.white}}>Recent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, this.state.showBonus ? styles.selected : styles.unselected ]} onPress={()=>{this.setState({showBonus: true})}}>
            <Text style={this.state.showBonus ?  {color: colors.white} : {color: 'black'}}>Bonus Content</Text>
        </TouchableOpacity>
        </View>
        )}
        <View style={{marginBottom: 30}}>
          <Text style={styles.description}>{series && series.desc}</Text>
        </View>
        </View>
      );
    }


    renderEpisode({item,index}) {
      return (
        <View>
        { index == 0 && this.renderHeader() }
        <ListItemEpisode item={item} goToEpisode={() => {this.goToEpisode(item)}}/>
        </View>
      );
    }

    playTrack() {
      if ( ! this.props.episode ) {
        return;
      }
      let track = {
        uri: this.props.episode.dataUrl,
        image: this.props.episode.thumbnailUrl,
        name: this.props.episode.name
     }

      this.props.setValue('currentTrack', track);
      this.props.togglePlayback();
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
      page: state.data.page
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
  episodesContainer: {

  },
  description: {
    fontSize: 13,
    paddingLeft: 5,
    paddingRight: 5,
    color: colors.white,
  },
    selected: {
      marginTop: 0,
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.black,
      backgroundColor: 'black',
      width: 160,
      height: 45,
      justifyContent: 'center',
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'row',
  },
  unselected: {
      marginTop: 0,
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.black,
      backgroundColor: 'white',
      width: 160,
      height: 45,
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
