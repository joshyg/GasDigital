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

        if (props.liveMode || !props.timer.playableDuration) { // don't render the slider if no track - important
            return null;
        }

        return (
            <Slider
                min={0}
                max={Math.floor(props.timer.playableDuration)}
                values={[ Math.floor(props.timer.currentTime) ]}
                sliderLength={props.isFooter ? width : width - 60}
                selectedStyle={{ backgroundColor: colors.yellow }}
                unselectedStyle={{ backgroundColor: 'grey' }}
                markerStyle={ props.canSet ? this.styles.marker : this.styles.none }
                pressedMarkerStyle={this.styles.pressedMarker}
                containerStyle={this.styles.sliderContainer}
                touchDimensions={{
                    height: touchTarget,
                    width: touchTarget,
                    borderRadius: 0,
                    slipDisplacement: 0
                }}
                trackStyle={this.styles.trackStyle}

                onValuesChangeStart={() => {props.isSettingTime(true);}}
                onValuesChange={val => {}}
                onValuesChangeFinish={val => {
                    props.setCurrentTime(val[0]);
                }}
                {...props}
            />
        );

    }
    styles = StyleSheet.create({
      sliderContainer: {
          position: 'absolute',
          marginHorizontal: this.props.isFooter ? 0 : 30,
          top: 0,
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
}

