import React, { Component } from "react";
import {
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image
} from "react-native";
import SvgButton from "./svg_button";
import PlayerControls from "../containers/player_controls";
import ProgressSlider from "./progress_slider";
import Svg from "./svg";
import _ from "lodash/fp";
import { colors } from "../constants";

const { height, width } = Dimensions.get("window");

const playerClicked = function(props) {
  if (!props.track || !props.track.id) {
    return;
  }
  props.showNowPlaying();
};

export default function Player(props) {
  const isPlaying =
    (!props.chromecastMode && props.isPlaying) ||
    (props.chromecastMode && props.isPlayingChromecast);

  const body = (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          props.navigateTo("player_view");
        }}
        style={styles.container}
      >
        {props.track &&
          props.timer.currentTime !== 0 && (
            <ProgressSlider
              isPlaying={isPlaying}
              timer={
                props.chromecastMode && !props.liveMode
                  ? props.videoTimer
                  : props.timer
              }
              liveMode={props.liveMode}
              setCurrentTime={props.setCurrentTime}
              isSettingTime={props.isSettingTime}
              isEnabled={props.isSliderEnabled}
              canSet={false}
              isFooter={true}
            />
          )}
        <View>
          {props.track && (
            <Text numberOfLines={2} style={styles.title}>
              {props.track.name}
            </Text>
          )}
        </View>
        {props.track && (
          <TouchableOpacity onPress={props.togglePlayback}>
            <Image
              style={{ height: 35, width: 35 }}
              source={
                isPlaying
                  ? require("../../assets/icons/pause_footer.png")
                  : require("../../assets/icons/play_footer.png")
              }
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );

  return !props.track ? null : (
    <TouchableOpacity
      onPress={() => {
        return playerClicked(props);
      }}
    >
      {body}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
    width: width,
    backgroundColor: "black",
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 10
  },
  marker: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#E8E8E8"
  },
  pressedMarker: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#E8E8E8"
  },
  none: {
    height: 0,
    width: 0
  },
  trackStyle: {
    borderRadius: 0,
    height: 2
  },
  title: {
    fontSize: 18,
    color: "white",
    width: width - 50
  }
});
