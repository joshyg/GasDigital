import React, {Component} from 'react';

import {View, Image, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '../constants';

const paths = {
  'pause': [ 'M129.967,264.657H59.647V35h70.319V264.657z M240.353,35.342h-70.318V265h70.318V35.342z' ],
  'play': [ 'M59.648,35v230l180.705-115.004L59.648,35z' ],
};

const WithSVG = function (props) {

    let svgProps = {
        height: props.height || '30',
        width: props.width || '30'
    };

    let pathProps = {
        scale: props.scale || 0.1,
        x: props.x || '0',
        y: props.y || '0',
        fill: props.fill || colors.yellow,
        fillOpacity: props.fillOpacity || 1
    };

    const pathData = paths[props.type];

    return (
      <Svg
        {...svgProps}
        {...props}
      >
        {
          pathData.map((d, i) => {
            return (
              <Path
                {...pathProps}
                d={d}
                key={i}
              />
            );
          })
        }
      </Svg>
    );
}
        
const WithoutSVG = function (props) {
  return (<Text>Img</Text>);
}

let IconSvg;
if (__DEV__ && Platform.OS == 'android') {
    IconSvg = WithoutSVG;
} else {
    IconSvg = WithSVG;
}
export default IconSvg;

