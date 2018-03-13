import React from "react";

import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  Alert,
  TouchableOpacity,
  Platform,
  Image,
  AsyncStorage,
  StatusBar
} from "react-native";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { navigateTo } from "../actions/navigation";

import { logOut } from "../actions/auth";
import Base from "./view_base";
import Svg from "../components/svg";
var Fabric = require("react-native-fabric");
var { Crashlytics } = Fabric;
import { DEBUG_CRASH, colors } from "../constants";

class Settings extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {}

  forceCrash = () => {
    if (DEBUG_CRASH) {
      console.log("Forcing crash!");
      Crashlytics.crash();
    }
  };

  render() {
    return (
      <Base navigation={this.props.navigation}>
        {/*
              <TouchableOpacity 
                style={styles.menuItemLast} 
                onPress={()=>{}}>
                  <Text style={styles.title}>Contact Us</Text>
              </TouchableOpacity>
                */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            this.props.navigateTo("about");
          }}
          onLongPress={this.forceCrash}
        >
          <Text style={styles.title}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            this.props.logOut();
          }}
        >
          <Text style={styles.title}>Log Out</Text>
        </TouchableOpacity>
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      logOut,
      navigateTo
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    color: colors.white,
    textAlign: "left",
    paddingLeft: 20,
    fontFamily: "Avenir"
  },
  menuItem: {
    padding: 10,
    paddingLeft: 0,
    width: "100%"
  }
});
