import React, {Component} from 'react';
import {View, Text, TouchableHighlight, TouchableOpacity, StyleSheet, StatusBar, Dimensions, Image} from 'react-native';
import Slider from '@ptomasroos/react-native-multi-slider';
import { colors, fonts } from '../constants';

export default class ProgressSlider extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const props = this.props;
        const { height, width } = Dimensions.get('window');

        const touchTarget = (props.isFooter || !props.canSet) ? 0 : 60;

        if (!props.timer.playableDuration) { // don't render the slider if no track - important
            return null;
        }

        return (
            <Slider
                min={0}
                max={Math.floor(props.timer.playableDuration)}
                values={[ Math.floor(props.timer.currentTime) ]}
                sliderLength={width}
                selectedStyle={{ backgroundColor: colors.yellow }}
                unselectedStyle={{ backgroundColor: 'grey' }}
                markerStyle={ props.canSet ? styles.marker : styles.none }
                pressedMarkerStyle={styles.pressedMarker}
                containerStyle={styles.sliderContainer}
                touchDimensions={{
                    height: touchTarget,
                    width: touchTarget,
                    borderRadius: 0,
                    slipDisplacement: 0
                }}
                trackStyle={styles.trackStyle}

                onValuesChangeStart={() => {props.isSettingTime(true);}}
                onValuesChange={val => {}}
                onValuesChangeFinish={val => {
                    props.setCurrentTime(val[0]);
                }}
                {...props}
            />
        );
    }
}

const styles = StyleSheet.create({
    sliderContainer: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    marker: {
        height: 11,
        width: 11,
        borderRadius: 5,
        backgroundColor: colors.blue
    },
        none: {
        height: 0,
        width: 0
    },
});
