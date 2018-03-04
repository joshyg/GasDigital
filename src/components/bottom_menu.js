import React, {Component} from 'react';
import {View, Text,Image, StyleSheet, TouchableOpacity, TouchableHighlight, ScrollView, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import _ from 'lodash/fp';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setActiveMenuItem, resetTo, navigateTo } from '../actions/navigation';
import SvgIcon from './svg_icons';
import { iconNames, colors, fonts } from '../constants';

class BottomMenu extends React.Component {
    setActiveMenu(item) {
        const activeItem = this.props.activeMenuItem;
        if (activeItem != item) {
            this.props.setActiveMenuItem(item);
        }
        this.props.resetTo(item);
    }

    renderIcon(name, activeItem) {
      return (
        <Icon 
          name={name}
          size={iconNames[activeItem] == name ? 33 : 30}
          color={iconNames[activeItem] == name ? "#fcf411" : '#8e8e93'}
        />
      );
    }


    render() {
        const { width } = Dimensions.get('window');
        const activeItem = this.props.activeMenuItem;
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'homescreen')}>
                    {this.renderIcon('headphones', activeItem)}
                    <Text style={[ styles.topMenuText,activeItem === 'homescreen' ? styles.selected : {}  ]}>Listen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'live')}>
                    {this.renderIcon('video-camera', activeItem)}
                    <Text style={[ styles.topMenuText, activeItem === 'live' ? styles.selected : {}  ]}>Live</Text>
                </TouchableOpacity>    
                        
                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'search')}>
                    {this.renderIcon('search', activeItem)}
                    <Text style={[  styles.topMenuText, activeItem === "search" ? styles.selected : {},{marginTop: -3} ]}>Search</Text>
                </TouchableOpacity>

                
                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'library')}>
                    {this.renderIcon('download', activeItem)}
                    <Text style={[ styles.topMenuText,activeItem === "library" ? styles.selected : {}]}>Library</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'settings')}>
                    {this.renderIcon('cog', activeItem)}
                    <Text style={[ styles.topMenuText,activeItem === "library" ? styles.selected : {}]}>Settings</Text>
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
    return bindActionCreators({ setActiveMenuItem, resetTo, navigateTo }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BottomMenu);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 54,
        justifyContent: 'space-around',
        width: width,
        backgroundColor: colors.footerBackground
    },
    menuItem: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    topMenuText: {
        fontSize: 10,
        color: colors.grey1
    },
    selected: {
        color: colors.grey1,
        fontWeight: 'bold'
    },
});
