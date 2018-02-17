import React from 'react';
import { FlatList, TouchableHighlight, TouchableOpacity, View, Dimensions, StyleSheet, Modal, Text } from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fonts, colors } from "../constants";
import { setValue } from '../actions/data';
import { setPlayerValue } from '../actions/player';
import Chromecast from 'react-native-google-cast';
import { navigateTo } from '../actions/navigation';

const { height, width } = Dimensions.get('window');

class ModalComponent extends React.Component {

  constructor(props) {
    super(props);
  }
  
  componentWillMount() {
    //this.props.setValue('showModal', true );
  } 


  connectToChromecastDevice = async (itemId) => {
    let connection = await Chromecast.connectToDevice(itemId);
    // disable any audio tracks
    this.props.setPlayerValue('isPlaying', false);
    this.props.setPlayerValue('isPlayingVideo', false);
    this.props.setValue('showModal', false);
    this.props.navigateTo("player_view");
  }

  renderChromecastMenuItem  = ({item}) => {
    console.log('JG: rendering cc menu item ', item );
    return (
      <TouchableOpacity onPress={() => { this.connectToChromecastDevice(item.id) }}>
        <Text style={styles.text}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  renderChromecastMenu = () => {
    let data = this.props.chromecast_devices || [];
    return (
        <View>
          <Text style={styles.text}>SELECT A DEVICE</Text>
          <FlatList
            data={data}
            renderItem={this.renderChromecastMenuItem}
          />
        </View>
    );
  }

  renderFunctions = {
    'chromecastControls': this.renderChromecastControls,
    'chromecastMenu': this.renderChromecastMenu,
  }

  renderModal() {
    const { showModal, modalType } = this.props;
    console.log('JG: rendering modal ', modalType );
    if ( ! showModal || ! modalType || ! this.renderFunctions[modalType] ) {
      return null;
    }
    return this.renderFunctions[modalType]();
  }

  render() {
    console.log('JG: rendering modal, type = ', this.props.modalType );
    return (
       <Modal
           animationType="fade"
           transparent={true}
           visible={this.props.showModal}
       >
         <View style={{alignItems: 'center', justifyContent: 'center'}} >
           <View>
             <TouchableOpacity onPress={() => {
                 this.props.setValue('showModal', false);
               }}>

                <View style={styles.background}>
                </View>                  
             </TouchableOpacity>
             <View style={styles.container}>
               { this.renderModal() }
             </View>
           </View>
         </View>      
       </Modal>
    );
  }
}

function mapStateToProps(state) {
    return {
      chromecast_devices: state.data.chromecast_devices,
      showModal: state.data.showModal,
      modalType: state.data.modalType,
      modalData: state.data.modalData
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      setValue,
      setPlayerValue,
      navigateTo
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalComponent);

let containerWidth = 280;
let marginHorizontal = 40;
if (width < 370) {
    marginHorizontal = 10;
    containerWidth = 300;
} else if (370 < width && width < 400) {
    marginHorizontal = 30;
    containerWidth = 320
} else if (400 <= width) { 
    marginHorizontal =  30;
    containerWidth = 360;
}

const styles = StyleSheet.create({
  container: {
    marginTop: height / 2 - 200,
    height: containerWidth / 2,
    marginHorizontal: marginHorizontal,
    width: containerWidth,
    backgroundColor: 'white',
    alignItems: 'center',  
    justifyContent: 'center',
  },
  background:{
    height: height,
    width: width + 5,
    backgroundColor: 'black',
    position: 'absolute',
    opacity: .8,
  },
  text:{
    color: colors.black,
    fontSize: 20,
    fontWeight: 'bold'
  },

});
