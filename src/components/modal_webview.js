import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  WebView,
  Linking
} from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import colors from "../../styles/colors";
import { toggleModal } from "../actions/navigation";

class WebViewModal extends Component {
  constructor(props) {
    super(props);

    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
  }
  goForward() {
    this.webView.goForward();
  }

  goBack() {
    this.webView.goBack();
  }

  cleanUri(url) {
    const start = url.slice(0, 4);

    return start === "http" ? url : `http://${url}`;
  }

  render() {
    const { data } = this.props;

    onClose = () => {
      this.props.toggleModal(false);
    };

    const uri = this.cleanUri(data);

    return (
      <View style={styles.container}>
        <View style={styles.control}>
          <TouchableHighlight
            style={{ marginLeft: 10 }}
            onPress={onClose}
            underlayColor={"transparent"}
          >
            <Text style={{ color: colors.teal }}>Done</Text>
          </TouchableHighlight>
        </View>
        <WebView
          ref={ref => (this.webView = ref)}
          source={{ uri }}
          style={{ flex: 1 }}
          scalesPageToFit={true}
        />
      </View>
    );
  }
}
function mapStateToProps(state) {
  return {};
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleModal
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(WebViewModal);

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    height: height,
    width: width,
    justifyContent: "flex-end",
    alignItems: "stretch"
  },
  control: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    paddingLeft: 0
  },
  row: {
    flexDirection: "row"
  }
});
