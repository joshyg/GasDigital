import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { resetTo, navigateTo } from '../actions/navigation';
import Base from './view_base';
import { getChannels, getEpisodes, setValue } from '../actions/data';
import { logOut } from '../actions/auth';

class Library extends React.Component {
    goToPage(item) {
      this.props.navigateTo(item);
    }

    render() {
        return (
            <Base navigation={this.props.navigation}>
              <View style={styles.channelsContainer}>

                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={()=>{this.goToPage('favorites')}}>
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.title}>Favorites</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={()=>{this.goToPage('playlist')}}>
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.title}>Playlist</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItemLast} 
                  onPress={()=>{this.goToPage('offline')}}>
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.title}>Offline</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Base>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        navigateTo,
        logOut
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Library);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
      fontSize: 30,
      color: 'black',
      textAlign: 'left',
  },
  menuItem: {
      padding: 10,
      width: '100%',
      borderStyle: 'solid',
      borderBottomWidth: 1,
      borderBottomColor: 'grey',
  },
  menuItemLast: {
      padding: 10,
      width: '100%',
  },
  channelsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
