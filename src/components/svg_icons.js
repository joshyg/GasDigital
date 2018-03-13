import React, { Component } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { DEBUG_NO_ANDROID_SVGS } from "../constants";

function WithSVG(props) {
  let scale = props.scale ? props.scale : 1;
  let translateY = props.translateY ? props.translateY : 0;
  let translateX = props.translateX ? props.translateX : 0;
  let liveTranslateX = 2;
  let liveTranslateY = 2;
  let liveScale = 0.25 || props.scale;
  let height = props.height ? props.height : 30;
  let width = props.width ? props.width : 30;
  let fill = props.fill ? props.fill : props.active ? "#FFDE16" : "#717171";

  switch (props.type) {
    case "home":
      return (
        <View style={props.style}>
          <Svg height={height} width={width}>
            <Path
              stroke="#E6E7E8"
              x={translateX}
              y={translateY}
              scale={scale}
              fill={props.fill}
              d="M45.0306567,9.31697643 C44.9952833,9.2793084 44.9457857,9.25792507 44.893966,9.25792507 C44.8421464,9.25792507 44.7926488,9.2793084 44.7572754,9.31697643 L35.275261,18.9420827 L35.275261,31.2579251 L41.599002,31.2579251 L41.599002,25.8335157 C41.599002,23.3503099 41.9083545,22.1051288 44.8364121,22.1051288 C47.7644696,22.1051288 48.0738221,23.7725264 48.0738221,25.8335157 L48.0738221,31.222144 L54.275261,31.222144 L54.275261,19.3929241 L54.275261,18.8705206 L45.0306567,9.31697643 Z"
            />
          </Svg>
        </View>
      );

    case "me":
      return (
        <View style={props.style}>
          <Svg height={height} width={width}>
            <Path
              stroke="#E6E7E8"
              fill={props.fill}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M10.808,0.496 C7.392,0.496 5.64,3.064 5.64,6.2 C5.64,8.344 7.392,11.904 10.808,11.904 C14.224,11.904 15.976,8.344 15.976,6.2 C15.976,3.064 14.2,0.496 10.808,0.496 Z"
            />
            <Path
              stroke="#E6E7E8"
              fill={props.fill}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M0.656,23.856 C0.722377605,18.1417294 5.28766241,13.4987677 11,13.336 C16.6918376,13.4855582 21.2521499,18.0988153 21.336,23.792 C21.336,25.392 11,25.464 11,25.464 L10.256,25.464 C7.856,25.408 0.656,25.144 0.656,23.856 Z"
            />
          </Svg>
        </View>
      );

    case "search":
      return (
        <View style={props.style}>
          <Svg height={height} width={width}>
            <Ellipse
              stroke="#E6E7E8"
              x={translateX}
              y={translateY}
              strokeWidth={props.strokeWidth}
              cx="8.11066667"
              cy="8.14016"
              rx="8.11066667"
              ry="8.14016"
            />
            <Path
              stroke="#E6E7E8"
              fill={props.fill}
              strokeWidth={props.strokeWidth}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M13.5,14.5 L20.5,21.5"
            />
          </Svg>
        </View>
      );

    case "library":
      return (
        <View style={props.style}>
          <Svg height={height} width={width}>
            <Path
              stroke="#E6E7E8"
              strokeWidth={props.strokeWidth}
              fill={props.fill}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M23,0 L23,23"
            />
            <Path
              stroke="#E6E7E8"
              strokeWidth={props.strokeWidth}
              fill={props.fill}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M16.7586207,0 L16.7586207,23"
            />
            <Path
              stroke="#E6E7E8"
              strokeWidth={props.strokeWidth}
              fill={props.fill}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M10.1724138,0 L10.1724138,23"
            />
            <Path
              stroke="#E6E7E8"
              strokeWidth={props.strokeWidth}
              fill={props.fill}
              x={translateX}
              y={translateY}
              scale={scale}
              d="M4.9137931,0.333333333 L0.477975062,22.9015304"
            />
          </Svg>
        </View>
      );

    case "live":
      return (
        <View>
          <Svg height="30" width="30">
            <Path
              x={liveTranslateX}
              y={liveTranslateY}
              scale={liveScale}
              fill={props.fill}
              d="M13.6,36.4c-2,0-3.6,1.6-3.6,3.6v21.7c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6V40 C17.2,38,15.6,36.4,13.6,36.4z M25.6,20.7c-2,0-3.6,1.6-3.6,3.6v53c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6v-53 C29.2,22.3,27.6,20.7,25.6,20.7z M37.7,8.6c-2,0-3.6,1.6-3.6,3.6v77.1c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V12.3 C41.3,10.3,39.7,8.6,37.7,8.6z M49.7,29.7c-2,0-3.6,1.6-3.6,3.6v35c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6v-35 C53.3,31.3,51.7,29.7,49.7,29.7z M61.8,8.6c-2,0-3.6,1.6-3.6,3.6v77.1c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V12.3 C65.4,10.3,63.8,8.6,61.8,8.6z M73.8,26.7c-2,0-3.6,1.6-3.6,3.6v41c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6v-41 C77.4,28.3,75.8,26.7,73.8,26.7z M85.9,37c-2,0-3.6,1.6-3.6,3.6v20.5c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V40.6 C89.5,38.6,87.9,37,85.9,37z"
            />
            {props.liveNow && <Circle cx="25" cy="5" r="5" fill="red" />}
          </Svg>
        </View>
      );
    case "chromecast":
      return (
        <View style={props.style}>
          <Svg height="30" width="30">
            <Path
              d="M1,18 L1,21 L4,21 C4,19.34 2.66,18 1,18 L1,18 Z M1,14 L1,16 C3.76,16 6,18.24 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z M1,10 L1,12 C5.97,12 10,16.03 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"
              id="cast"
              fill={props.fill}
            />
          </Svg>
        </View>
      );

    default:
      return (
        <View>
          <Svg height="30" width="30">
            <Path
              x={translateX}
              y={translateY}
              scale={scale}
              fill={fill}
              d="M13.6,36.4c-2,0-3.6,1.6-3.6,3.6v21.7c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6V40 C17.2,38,15.6,36.4,13.6,36.4z M25.6,20.7c-2,0-3.6,1.6-3.6,3.6v53c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6v-53 C29.2,22.3,27.6,20.7,25.6,20.7z M37.7,8.6c-2,0-3.6,1.6-3.6,3.6v77.1c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V12.3 C41.3,10.3,39.7,8.6,37.7,8.6z M49.7,29.7c-2,0-3.6,1.6-3.6,3.6v35c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6v-35 C53.3,31.3,51.7,29.7,49.7,29.7z M61.8,8.6c-2,0-3.6,1.6-3.6,3.6v77.1c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V12.3 C65.4,10.3,63.8,8.6,61.8,8.6z M73.8,26.7c-2,0-3.6,1.6-3.6,3.6v41c0,2,1.6,3.6,3.6,3.6c2,0,3.6-1.6,3.6-3.6v-41 C77.4,28.3,75.8,26.7,73.8,26.7z M85.9,37c-2,0-3.6,1.6-3.6,3.6v20.5c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V40.6 C89.5,38.6,87.9,37,85.9,37z"
            />
          </Svg>
        </View>
      );
  }
}

// NOTE! Testing Android purposes only
const WithoutSVG = function(props) {
  return <Text>Img</Text>;
};

let IconSvg;
if (DEBUG_NO_ANDROID_SVGS && __DEV__ && Platform.OS == "android") {
  IconSvg = WithoutSVG;
} else {
  IconSvg = WithSVG;
}
export default IconSvg;
