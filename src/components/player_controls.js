import React from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Platform
} from "react-native";
import _ from "lodash/fp";
import ProgressSlider from "./progress_slider";
import { colors, fonts } from "../constants";
import Icon from "react-native-vector-icons/FontAwesome";

export default function PlayerControlsComponent(props) {
  const { height, width } = Dimensions.get("window");
  const { track } = props;

  const playPause = props.isPlaying
    ? require("../../assets/icons/pause.png")
    : require("../../assets/icons/play.png");
  const previous = !props.hasPrevious
    ? require("../../assets/icons/previous_disabled.png")
    : require("../../assets/icons/previous.png");
  const next = !props.hasNext
    ? require("../../assets/icons/next_disabled.png")
    : require("../../assets/icons/next.png");

  const skipForwardFifteenButton = require("../../assets/icons/skip_fifteen_ahead.png");
  const skipBackFifteenButton = require("../../assets/icons/skip_fifteen_back.png");
  let HIT_SLOP = 15;

  let trackName = "";
  if (track.name && track.name.length < 20) {
    trackName = track.name;
  } else if (track.name && track.name.length > 20) {
    trackName = track.name.slice(0, 20) + "...";
  }

  return (
    <View>
      <ProgressSlider
        isPlaying={props.isPlaying}
        timer={
          props.chromecastMode && !props.liveMode
            ? props.videoTimer
            : props.timer
        }
        liveMode={props.liveMode}
        setCurrentTime={props.setCurrentTime}
        isSettingTime={() => {}}
        isEnabled={props.isSliderEnabled}
        canSet={true}
      />
      <View style={styles.dataProgress}>
        <Text style={styles.timeText}>{props.progressTime}</Text>
        <Text style={styles.timeText}>{track.length}</Text>
      </View>

      <View
        style={[
          { paddingLeft: 15, paddingRight: 15 },
          Platform.OS === "android" ? { marginBottom: 0 } : { marginBottom: 25 }
        ]}
      >
        <Text style={styles.title}>{trackName}</Text>
        {track.seriesTitle && (
          <Text style={styles.seriesTitle}>{track.seriesTitle}</Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          disabled={!props.hasPrevious}
          onPress={props.onPreviousPress}
        >
          <Image style={styles.jump} resizeMode={"contain"} source={previous} />
        </TouchableOpacity>

        {!props.liveMode && (
          <TouchableOpacity onPress={props.seekBackFifteen}>
            <Icon name={"backward"} size={30} color={colors.white} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={props.onPlayPress}>
          <Icon
            name={props.isPlaying ? "pause" : "play"}
            size={60}
            color={colors.white}
          />
        </TouchableOpacity>

        {!props.liveMode && (
          <TouchableOpacity onPress={props.seekForwardFifteen}>
            <Icon name={"forward"} size={30} color={colors.white} />
          </TouchableOpacity>
        )}

        <TouchableOpacity disabled={!props.hasNext} onPress={props.onNextPress}>
          <Image style={styles.jump} resizeMode={"contain"} source={next} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { height, width } = Dimensions.get("window");

let controlMarginTop = 30;
if (Platform.OS === "android") {
  controlMarginTop = 5;
} else if (height < 600) {
  //iPhone5
  controlMarginTop = 0;
}

const styles = StyleSheet.create({
  jump: {
    height: 40,
    width: 40
  },
  dataProgress: {
    marginTop: 10,
    marginLeft: 30,
    justifyContent: "space-between"
  },
  controls: {
    flexDirection: "row",
    width: width,
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: controlMarginTop
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    fontFamily: "Avenir",
    textAlign: "center"
  },
  seriesTitle: {
    fontSize: 24,
    color: colors.yellow,
    fontFamily: "Avenir",
    textAlign: "center"
  },
  timeText: {
    fontSize: 10,
    color: colors.white,
    fontFamily: "Avenir"
  }
});
