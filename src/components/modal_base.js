import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  Modal,
  Dimensions
} from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { toggleModal } from "../actions/navigation";
import WebViewModal from "./modal_webview";
import colors from "../../constants";

const bodyByType = {
  web: WebViewModal
};

function ModalBase({ data, type, isOpen, toggleModal, navigation }) {
  const Body = bodyByType[type];
  let animationType = "fade";
  let transparent = type !== "web";

  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={isOpen}
      onRequestClose={() => {
        toggleModal(false);
      }}
    >
      <View style={transparent ? {} : styles.container}>
        {isOpen && (
          <Body
            type={type}
            data={data}
            close={() => toggleModal(false)}
            toggleModal={toggleModal}
            navigation={navigation}
          />
        )}
      </View>
    </Modal>
  );
}

function mapStateToProps(state) {
  return {
    type: state.navigation.modalType,
    data: state.navigation.modalData,
    isOpen: !!state.navigation.modalData
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleModal
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalBase);

const { height, width } = Dimensions.get("window");

const playerHeight = 50;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.grey4
  }
});
