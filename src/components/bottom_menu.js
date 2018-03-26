import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import _ from 'lodash/fp';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setActiveMenuItem, resetTo, navigateTo} from '../actions/navigation';
import Svg, {Circle} from 'react-native-svg';
import {iconNames, routeHeaders, colors, fonts} from '../constants';

class BottomMenu extends React.Component {
  setActiveMenu(item) {
    const activeItem = this.props.activeMenuItem;
    if (activeItem != item) {
      this.props.setActiveMenuItem(item);
    }
    this.props.resetTo(item);
  }

  renderIcon(name, activeItem) {
    let bigSize = 33;
    let littleSize = 30;
    return (
      <Icon
        name={name}
        size={iconNames[activeItem] == name ? bigSize : littleSize}
        color={iconNames[activeItem] == name ? '#fcf411' : '#8e8e93'}
      />
    );
  }

  renderRedCircle() {
    return (
      <View style={{position: 'absolute'}}>
        <Svg height="30" width="30">
          <Circle cx="27" cy="3" r="3" fill="red" />
        </Svg>
      </View>
    );
  }

  render() {
    const {width} = Dimensions.get('window');
    const activeItem = this.props.activeMenuItem;
    let containerStyle = [styles.container];
    if (activeItem == 'live' && this.props.liveNow) {
      containerStyle.push({backgroundColor: 'black'});
    }
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={this.setActiveMenu.bind(this, 'homescreen')}>
          {this.renderIcon(iconNames['homescreen'], activeItem)}
          <Text
            style={[
              styles.bottomMenuText,
              activeItem === 'homescreen' ? styles.selected : {},
            ]}>
            {routeHeaders['homescreen']}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={this.setActiveMenu.bind(this, 'live')}>
          {this.renderIcon(iconNames['live'], activeItem)}
          {this.props.liveNow && this.renderRedCircle()}
          <Text
            style={[
              styles.bottomMenuText,
              activeItem === 'live' ? styles.selected : {},
            ]}>
            {routeHeaders['live']}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={this.setActiveMenu.bind(this, 'search')}>
          {this.renderIcon(iconNames['search'], activeItem)}
          <Text
            style={[
              styles.bottomMenuText,
              activeItem === 'search' ? styles.selected : {},
            ]}>
            {routeHeaders['search']}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={this.setActiveMenu.bind(this, 'library')}>
          {this.renderIcon(iconNames['library'], activeItem)}
          <Text
            style={[
              styles.bottomMenuText,
              activeItem === 'library' ? styles.selected : {},
            ]}>
            {routeHeaders['library']}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={this.setActiveMenu.bind(this, 'settings')}>
          {this.renderIcon(iconNames['settings'], activeItem)}
          <Text
            style={[
              styles.bottomMenuText,
              activeItem === 'library' ? styles.selected : {},
            ]}>
            {routeHeaders['settings']}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeMenuItem: state.navigation.activeMenuItem,
    liveNow: state.player.liveNow,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({setActiveMenuItem, resetTo, navigateTo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BottomMenu);

const {width, height} = Dimensions.get('window');
let containerHeight = height >= 800 ? 69 : 54;
let menuMarginBottom = height >= 800 ? 10 : 5;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: containerHeight,
    justifyContent: 'space-around',
    width: width,
    backgroundColor: colors.footerBackground,
  },
  menuItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: menuMarginBottom,
  },
  bottomMenuText: {
    fontSize: 10,
    color: colors.grey1,
    bottom: 0,
  },
  selected: {
    color: colors.grey1,
    fontWeight: 'bold',
  },
});
