import React, { Component } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Svg from "./svg";
import { colors, fonts } from "../constants";

export default function SvgButton(props) {
  const HIT_SLOP = 15;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={props.onPress}
        disabled={props.disabled}
        hitSlop={{
          top: props.HIT_SLOP_TOP || HIT_SLOP,
          left: props.HIT_SLOP_LEFT || HIT_SLOP,
          bottom: props.HIT_SLOP_BOTTOM || HIT_SLOP,
          right: props.HIT_SLOP_RIGHT || HIT_SLOP
        }}
      >
        <Svg height="30" width="30" {...props} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  }
});
