import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';

import Base from './view_base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { colors } from '../constants.js';


class About extends React.Component {
    constructor(props) {
      super(props);
      this.state = {

      }
    }

    render() {
      return (
        <Base navigation={this.props.navigation}>
          <ScrollView>
          <View style={{alignItems: 'center', paddingLeft: 8, paddingRight: 8}}>
            <Text style={styles.text}>{"Let's talk a bit about what makes GaS Digital different, and why we know you'll want to #PlugInFuelUp with us! First and foremost every podcast on the network will always be FREE. You don't have to pay a dime if you don't want to. The newest 10 episodes will always be on iTunes, Stitcher, Google Play, or even God-forbid on a Zune, you can listen to any of the shows on the network so let's just get that out of the way first! No money, not a single thin dime. Got it? Good.\n"}</Text>
              <Text style={styles.text}>{"Now if you are someone who wants to WATCH THE VIDEO VERSION LIVE as it happens, partake in our CHAT ROOM or FORUMS, have access to COMMERCIAL FREE episodes, and download the podcast THE DAY IT'S RECORDED you will want to sign up for GaS Digital Membership! Membership is just $7 per month and you will have access to all of our shows and exclusive bonus content not available anywhere else. If you use a promo code for your favorite show you not only will be supporting their show directly but you will also save $1 off of membership and you get a two week FREE TRIAL!"}</Text>
          </View>
          </ScrollView>
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

    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(About);

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: colors.white,
    fontFamily: 'Avenir'
  }
});
