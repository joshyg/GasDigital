import React from 'react';
import {View, Text, Dimensions, StyleSheet, Image, TouchableHighlight, TouchableOpacity, Platform} from 'react-native';
import _ from 'lodash/fp';
import ProgressSlider from './progress_slider';
import { colors, fonts } from '../constants';



export default function PlayerControlsComponent(props) {
    const { height, width } = Dimensions.get('window');
    const { track } = props;

    const playPause =  props.isPlaying ? require('../../assets/icons/pause.png') : require('../../assets/icons/play.png') ;
    const previous = (!props.hasPrevious) ?  require('../../assets/icons/previous_disabled.png') : require('../../assets/icons/previous.png')
    const next = !props.hasNext ?  require('../../assets/icons/next_disabled.png') : require('../../assets/icons/next.png')

    const skipForwardFifteenButton = require('../../assets/icons/skip_fifteen_ahead.png');
    const skipBackFifteenButton = require('../../assets/icons/skip_fifteen_back.png');
    let HIT_SLOP = 15;

    return (
        <View>
            <ProgressSlider
                isPlaying={props.isPlaying}
                timer={props.chromecastMode && ! props.liveMode ? 
                       props.videoTimer : props.timer}
                liveMode={props.liveMode}
                setCurrentTime={props.setCurrentTime}
                isSettingTime={()=>{}}
                isEnabled={props.isSliderEnabled}
                canSet={!props.isDiscoveryMode}
            />
            <View style={styles.dataProgress}>
                    <Text style={[ fonts.content, fonts.small ]}>{props.progressTime}</Text>
                    <Text style={[ fonts.content, fonts.small ]}>{track.length}</Text>
            </View>

                <View style={[{paddingLeft: 15, paddingRight: 15},Platform.OS === 'android' ? {marginBottom: 0} : {marginBottom: 25}] }>
                    <Text style={styles.title}>
                        {track.name}
                    </Text>
                </View>
            
                
                <View style={styles.controls}>
                    <TouchableOpacity disabled={!props.hasPrevious} onPress={props.onPreviousPress}>
                        <Image
                            style={styles.jump}
                            resizeMode={'contain'}
                            source={previous}
                        />
                    </TouchableOpacity>

                { ! props.liveMode && <TouchableOpacity onPress={props.seekBackFifteen}>
                        <Image
                            style={styles.jump}
                            resizeMode={'contain'}
                            source={skipBackFifteenButton}
                        />
                    </TouchableOpacity> }
    
                    <TouchableOpacity onPress={props.onPlayPress}>
                        <Image
                            source={playPause}
                            style={{height: 100, width: 100}}
                        />
                    </TouchableOpacity>
                    
                  { !props.liveMode && <TouchableOpacity onPress={props.seekForwardFifteen}>
                        <Image
                            style={styles.jump}
                            resizeMode={'contain'}
                            source={skipForwardFifteenButton}
                        />
                    </TouchableOpacity> }

                    <TouchableOpacity disabled={!props.hasNext} onPress={props.onNextPress}>
                        <Image
                            style={styles.jump}
                            resizeMode={'contain'}
                            source={next}
                        />
                    </TouchableOpacity>
                </View>



        </View>
    );
}

const { height, width } = Dimensions.get('window');

let controlMarginTop = 30;
if ( Platform.OS === 'android' ) {
  controlMarginTop = 5;
} else if ( height < 600 ) { //iPhone5
  controlMarginTop = 0;
}


const styles = StyleSheet.create({
    progress: {
        borderWidth: 1,
        borderColor: colors.yellow,
        height: 0,
        position: 'absolute',
        left: 0,
        bottom: height - (height * 0.5) - (50 * 2)
    },

    jump:{
        height: 40,
        width: 40,
    },
    dataProgress: {
        marginTop: 10,
        justifyContent: 'space-between'
    },
    controls: {
        flexDirection: 'row',
        width: width,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: controlMarginTop,
        
    },
    title: {
        fontSize: 20
    }
});
