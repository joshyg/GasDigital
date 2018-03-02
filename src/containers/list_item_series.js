import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';
import{ colors } from '../constants';


const { width } = Dimensions.get('window');

export default function ListItemSeries (props) {
  const { item } = props;
  return (

		<TouchableOpacity style={styles.container} onPress={()=>{props.goToSeries(item)}}>
	     	<Image 
	        style={styles.thumbnail}
	        source={{
            uri: item.thumb,
            cache: 'force-cache'
          }}
	     	/>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 150,
        width: width/2,
        paddingBottom: 10,
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: colors.bodyBackground
    },
    thumbnail: {
    	width: 150, 
    	height: 150,
    	marginLeft: 15,
      borderRadius: 15
    },
    title: {
    	fontSize: 20
    }
});




