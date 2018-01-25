import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';


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

	     	<View style={{width: width - 130, marginLeft: 10}}>
        		<Text style={styles.title}>{item.title}</Text>
        	</View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 110,
        width: width,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        paddingBottom: 10,
        marginBottom: 10,
        alignItems: 'center'
    },
    thumbnail: {
    	width: 100, 
    	height: 100,
    	marginLeft: 15,
    },
    title: {
    	fontSize: 20
    }
});




