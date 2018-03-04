import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import { colors } from '../constants';
const { width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Entypo';

export default function ListItemEpisode (props) {
    const { item } = props;

    let description = item && item.description;
    if ( typeof description != 'string' ) {
      description = '';
    }
    if ( description.length > 240 ) {
      description = description.slice(0,240) + '...';
    }
    return (
      <View>
        <View style={{alignItems:'flex-end', marginRight: 5}} >
          <Icon 
            name={'dots-three-horizontal'}
            size={30}
            color={colors.yellow}
          />
        </View>
  		  <TouchableOpacity   style={styles.container} onPress={()=>{props.goToEpisode(item)}}>
  	     	<View style={[props.playlistView ? {width: width - 50} : {width: width},{marginLeft: 10}]}>
        		<Text style={styles.title}>{item && item.name}</Text>
            <Text style={styles.description}>{description}</Text>
            {(props.spinny && (<Image key="audio" style={styles.icon} 
                source={require('../../assets/icons/spinny.gif')}/>))}
        	</View>
  
          {props.playlistView &&
              <TouchableOpacity onPress={props.removeFromPlaylist}>
                  <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
          }
        </TouchableOpacity>
      </View> 
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: width,
        marginBottom: 10,
        paddingBottom: 10,
        alignItems: 'center'
    },
    title: {
      fontFamily: 'Avenir',
    	fontSize: 14,
      marginBottom: 5,
      fontWeight: '900',
      color: colors.yellow,
    },
    description: {
      fontSize: 14,
      color: colors.white,
      fontFamily: 'Avenir',
      fontWeight: '300',
    },
    icon: {
        height: 20,
        width: 20,
        marginLeft: 5
    }
});




