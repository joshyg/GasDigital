import React from 'react';
import {TextInput, Text, StyleSheet, View, Dimensions, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resetTo } from '../actions/navigation';
import { logIn, logInAsGuest } from '../actions/auth';
import Base  from './view_base';
import { colors } from '../constants';
import Orientation from 'react-native-orientation';
import { getChannels, getRecentVideos } from '../actions/data';

class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        username: '',
        password: ''
      }
    }

    componentWillMount() {
      if( ( this.props.user_id && this.props.user_id != 'logged_out' ) || this.props.guest){
        this.props.resetTo('homescreen');
      } else {
        // prefetch data/images
        this.props.getChannels();
        this.props.getRecentVideos(0,10);
      }
    }

    componentDidMount() {
      Orientation.lockToPortrait();
    }

    componentWillReceiveProps(nextProps) {
      // FIXME: replace user_id with real token when oauth is up
      if( ( nextProps.user_id && nextProps.user_id != 'logged_out' ) || nextProps.guest){
          this.props.resetTo('homescreen');
      }
    }

    logIn = () => {
      this.props.logIn(this.state.username,this.state.password);
    }   

    logInAsGuest = () => {
      this.props.logInAsGuest();
    }   

    render() {
        return (
            <View style={styles.inputContainer}>
              <Image style={{height: 80, marginTop: 50}} resizeMode={'contain'} source={require('../../assets/images/logo.png')}/>
              <Text>{"\n"}</Text>
              <TextInput style={styles.textInput} onChangeText={x => this.setState({username:x})} underlineColorAndroid={'transparent'} placeholder={'username'} type="TextInput"/>
              <Text>{"\n"}</Text>
              <TextInput style={styles.textInput} onChangeText={x => this.setState({password:x})} underlineColorAndroid={'transparent'} placeholder={'password'} type="TextInput" secureTextEntry={true}/>
              <Text>{"\n"}</Text>
              <TouchableOpacity style={styles.button} onPress={this.logIn} >
                <Text>Log In</Text>
              </TouchableOpacity>
              <Text>{"\n"}</Text>
              <TouchableOpacity style={styles.button} onPress={this.logInAsGuest} >
                <Text>Continue As Guest</Text>
              </TouchableOpacity>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        error: state.auth.errorMessage,
        user_id: state.auth.user_id,
        reduxRehydrated: state.storage.loaded,
        guest: state.auth.guest
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        resetTo,
        logIn,
        logInAsGuest,
        getChannels,
        getRecentVideos,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

 const { height, width } = Dimensions.get('window');
 
 let buttonWidth = 288;
 if (width <  350){
     buttonWidth = 268;
 }
 
const styles = StyleSheet.create({
   button: {
       marginTop: 0,
       marginBottom: 0,
       borderWidth: 1,
       borderColor: colors.yellow,
       backgroundColor: colors.yellow,
       width: buttonWidth,
       height: 45,
       justifyContent: 'center',
       padding: 12,
       marginLeft: 5,
       marginRight: 5,
       alignItems: 'center',
       justifyContent: 'center'
   },
   inputContainer: {
       borderWidth: 0,
       borderLeftWidth: 0,
       borderRightWidth: 0,
       padding: 0,
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: 'transparent',
       width: width,
       top: 90,
       position: 'absolute'
   },
   textInput: {
       backgroundColor: colors.grey2,
       paddingTop: 10,
       paddingLeft: 10,
       height: 40,
       width: buttonWidth,
       marginTop: 5,
       color: colors.yellow,
   }
});
