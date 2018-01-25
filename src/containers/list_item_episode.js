import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity, View,Dimensions, FlatList, Alert, Platform, Image, StatusBar } from 'react-native';


const { width } = Dimensions.get('window');

export default function ListItemEpisode (props) {
    const { item } = props;

    let description = item && item.description;
    if ( typeof description != 'string' ) {
      description = '';
    }
    return (
		<TouchableOpacity style={styles.container} onPress={()=>{props.goToEpisode(item)}}>
	     	<Image 
	        style={styles.thumbnail}
	        source={{
            uri: item && item.thumbnailUrl,
            cache: 'force-cache'
          }}
	     	/>

	     	<View style={[props.playlistView ? {width: width - 180} : {width: width - 130},{marginLeft: 10}]}>
        		<Text numberOfLines={1} style={styles.title}>{item && item.name}</Text>
                <Text numberOfLines={1} style={styles.description}>{description}</Text>
                {(props.spinny && (<Image key="audio" style={styles.icon} 
                    source={require('../../assets/icons/spinny.gif')}/>))}
        	</View>

            {props.playlistView &&
                <TouchableOpacity onPress={props.removeFromPlaylist}>
                    <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
                </TouchableOpacity>
            }
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
        marginBottom: 10,
        paddingBottom: 10,
        alignItems: 'center'
    },
    thumbnail: {
    	width: 100, 
    	height: 100,
    	marginLeft: 15,
    },
    title: {
    	fontSize: 20,
        marginBottom: 5
    },
    description: {
        fontSize: 15
    },
    icon: {
        height: 20,
        width: 20,
        marginLeft: 5
    }
});




