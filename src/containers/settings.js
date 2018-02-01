import React from 'react';

import {Text, StyleSheet, View, Dimensions,  Alert, TouchableOpacity, Platform, Image, AsyncStorage, StatusBar } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo } from '../actions/navigation';

import { logOut } from '../actions/auth';
import Base from './view_base'
import Svg from '../components/svg';
var Fabric = require('react-native-fabric');
var { Crashlytics } = Fabric;
import { DEBUG_CRASH } from '../constants';

class Settings extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps){

    }

    forceCrash = () => {
      if ( DEBUG_CRASH ) {
        console.log('Forcing crash!');
        Crashlytics.crash();
      }
    }


    render() {
        return (
            <Base navigation={this.props.navigation}>
              {/*
              <TouchableOpacity 
                style={styles.menuItemLast} 
                onPress={()=>{}}>
                  <Text style={styles.title}>Contact Us</Text>
              </TouchableOpacity>
                */}
              <TouchableOpacity 
                style={styles.menuItemLast} 
                onPress={()=>{this.props.navigateTo('about')}}
                onLongPress={this.forceCrash}>
                  <Text style={styles.title}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItemLast} 
                onPress={()=>{this.props.logOut()}}>
                  <Text style={styles.title}>Log Out</Text>
              </TouchableOpacity>

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
      logOut,
      navigateTo,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
const { height, width } = Dimensions.get('window');


const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
      alignItems: 'center',
      width: width - 80
  },
  header: {
      flexDirection: 'row',
      paddingLeft: 10,
      paddingRight: 10,
      alignItems: 'center',
      marginBottom: 20,
      paddingTop: 10
  },
  title: {
      fontSize: 30,
      color: 'black',
      textAlign: 'left',
      paddingLeft: 20
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
      paddingLeft: 0,
      width: '100%',
  },
  icon: {
      height: 20,
      width: 20,
      resizeMode: 'contain'
  },
  tab: {
      paddingLeft: 10,
      borderColor: 'black',
      borderBottomWidth: 1,
      height: 50,
      //justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
  },
  tabText: {
      width: width - 50,
      height: 30,
      justifyContent: 'center',
      alignItems:'center',
      marginTop: 11
  }
});
