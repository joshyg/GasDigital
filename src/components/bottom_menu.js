import React, {Component} from 'react';
import {View, Text,Image, StyleSheet, TouchableOpacity, TouchableHighlight, ScrollView, Dimensions} from 'react-native';

import _ from 'lodash/fp';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setActiveMenuItem, resetTo, navigateTo } from '../actions/navigation';
import SvgIcon from './svg_icons';
import { colors, fonts } from '../constants';

class BottomMenu extends React.Component {
    setActiveMenu(item) {
        const activeItem = this.props.activeMenuItem;
        if (activeItem != item) {
            this.props.setActiveMenuItem(item);
        }
        this.props.resetTo(item);
    }

    render() {
        const { width } = Dimensions.get('window');
        const activeItem = this.props.activeMenuItem;
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'homescreen')}>
                    <SvgIcon 
                      style={{marginLeft: -35, marginTop: -7}} 
                      type="home" 
                      scale={1}  
                      height={35} 
                      width={55} 
                      fill={activeItem === 'home' ? colors.white : null}/>
                    <Text style={[ {marginTop: -3}, styles.topMenuText,activeItem === 'homescreen' ? styles.selected : {}  ]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'live')}>
                    <SvgIcon 
                      translateX={"11"} 
                      translateY={"4"} 
                      type="live" 
                      scale={.94} 
                      height={35} 
                      width={45} 
                      fill={colors.white} 
                      strokeWidth={activeItem === 'live' ? "2" : "1"}/>
                    <Text style={[ {marginTop: -8}, styles.topMenuText, activeItem === 'live' ? styles.selected : {}  ]}>Live</Text>
                </TouchableOpacity>    
                        
                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'search')}>
                    <SvgIcon 
                      translateX="4" 
                      translateY="4" 
                      type="search" 
                      scale={1} 
                      height={30} 
                      width={30} 
                      strokeWidth={activeItem === "search" ? "2" : "1"} 
                      fill={activeItem === "search" ? colors.white : colors.grey1}/>
                    <Text style={[  styles.topMenuText, activeItem === "search" ? styles.selected : {},{marginTop: -3} ]}>Search</Text>
                </TouchableOpacity>

                
                <TouchableOpacity style={styles.menuItem} onPress={this.setActiveMenu.bind(this,'library')}>
                    <SvgIcon 
                      style={{marginRight: -3}} 
                      translateY="2" 
                      type="library" 
                      scale={.9} 
                      height={26} 
                      width={24} 
                      fill={activeItem === "library" ? colors.white : null}/>
                    <Text style={[ styles.topMenuText,activeItem === "library" ? styles.selected : {}]}>Library</Text>
                </TouchableOpacity>
                                                               
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeMenuItem: state.navigation.activeMenuItem,
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
        backgroundColor: colors.grey2
    },
    menuItem: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        height: 24,
        width: 24,
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
