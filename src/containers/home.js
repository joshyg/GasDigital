import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import ListItemSeries from './list_item_series';
import Base from './view_base';
import { getSchedule, getBonusContent, getRecentVideos, getFavorites, getChannels, getEpisodes, setValue } from '../actions/data';
import _ from 'lodash/fp';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import { setPlayerValue } from '../actions/player';
import { colors, ENABLE_PREFETCH } from '../constants';

class Home extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        channel: '',
        pageDict: {}
      }
      this.goToSeries = this.goToSeries.bind(this);
      this.prefetchEpisodes = _.throttle(2000,this.prefetchEpisodes);
    }

    componentWillMount(){
      this.props.getSchedule();
      this.props.getChannels(this.props.user_id);
      this.props.getRecentVideos(this.props.user_id,20);
      this.props.getFavorites(this.props.user_id);
      this.prefetchEpisodes(this.props);
      this.props.setPlayerValue('videoMode', false);
    }

    componentWillReceiveProps(nextProps) {
      // be cautious not to delay the active series fetch with prefetching
      if ( ! nextProps.isGettingEpisodes ) {
        if ( !nextProps.routes || nextProps.routes.length <= 2 ||
             nextProps.routes[nextProps.routes.length-1].routeName != "series" ) {
          this.prefetchEpisodes(this.props);
        }
      }
    }

    componentDidMount() {

    }

    prefetchEpisodes(props) {
      if ( ! ENABLE_PREFETCH || this.props.guest ) {
        return;
      }
      for ( ch in props.channels ) {
        let channel = props.channels[ch];
        channel = channel.link.split('cat=')[1];
        if ( ! this.props.channelEpisodeIds[channel] ||
               this.props.channelEpisodeIds[channel].length == 0 ) {
            props.setValue('isGettingEpisodes', true);
            this.props.getEpisodes(channel,this.props.user_id)
            this.props.getBonusContent(channel);
            break;
        }
      }
    }

    goToSeries(item) {
      if ( item.all_recent ) {
        this.props.getRecentVideos(this.props.user_id);
        this.props.navigateTo('recent');
      } else {
        this.props.setValue('series',item);
        this.props.navigateTo('series');
      }
    }


    goToEpisode(item) {
      console.log('JG: going to episode', item );
      this.props.setValue('episode',item);
      this.props.navigateTo('episode');
    }

    renderChannel({item}) {
      return (
        <ListItemSeries item={item} goToSeries={this.goToSeries}/>
      );
    }

    renderRow({item}) {
      return (
        <FlatList
          data={item}
          renderItem={this.renderChannel.bind(this)}
          keyExtractor={(item, index) => { return item.id }}
          horizontal={true}
        />
      );
    } 
    

    channels = () => {
      let channels = _.cloneDeep(this.props.channels);
      let recentImage = resolveAssetSource(require('../../assets/images/recent-icon.png'));
      // let recentImage = null
      if ( ! channels ) {
        channels = [];
      }
      if ( ! this.props.guest ) {
        channels.unshift({
          id: 'all_recent',
          all_recent:true,
          title:'All Recent', 
          thumb: recentImage.uri
        });
      }
      return channels;
    }

    rows = () => {
      let channels = this.channels();
      let rows = [];
      let row = [];
      for ( ch of channels ) {
        row.push(ch);
        if ( row.length == 2 ) {
          rows.push(_.cloneDeep(row));
          row = [];
        }
      }
      if ( row.length > 0 ) {
        rows.push(_.cloneDeep(row));
      }
      return rows;
    }





    
    render() {
        return (
            <Base hideBackButton={true} navigation={this.props.navigation}>
              <View style={styles.channelsContainer}>
                <FlatList
                  data={this.rows()}
                  renderItem={this.renderRow.bind(this)}
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
      guest: state.auth.guest,
      channels: state.data.channels,
      channelEpisodeIds: state.data.channelEpisodeIds,
      isGettingEpisodes: state.data.isGettingEpisodes,
      routes: state.navigation.routes,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        navigateTo,
        getChannels,
        getEpisodes,
        getRecentVideos,
        setValue,
        setPlayerValue,
        getBonusContent,
        getSchedule,
        getFavorites,
    }, dispatch);
}

ReactMixin.onClass(Home, TimerMixin);
export default connect(mapStateToProps, mapDispatchToProps)(Home);

const styles = StyleSheet.create({
  channelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bodyBackground
  },
  episodesContainer: {
    alignItems: 'flex-start',
  },
  episodeRow: {
    flexDirection: 'row'
  },
});
