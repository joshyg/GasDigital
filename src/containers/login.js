import React from 'react';
import {TextInput, Text, StyleSheet, View, Dimensions, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resetTo } from '../actions/navigation';
import { logIn, logInAsGuest, setAuthValue } from '../actions/auth';
import Base  from './view_base';
import { colors } from '../constants';
import Orientation from 'react-native-orientation';
import { getChannels, getRecentVideos } from '../actions/data';

const { height, width } = Dimensions.get('window');
 

class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        email: '',
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
      if ( ! this.props.loginError && nextProps.loginError ) {
        Alert.alert("Login Error", "Invalid Email/Password");
        this.props.setAuthValue("loginError", false);
      }
    }

    logIn = () => {
      this.props.logIn(this.state.email,this.state.password);
    }   

    logInAsGuest = () => {
      this.props.logInAsGuest();
    }   

    render() {
        let marginTop = width < 350 ? 0 : 50;
        return (
            <View style={styles.inputContainer}>
              <Image style={{height: 80, marginTop }} resizeMode={'contain'} source={require('../../assets/images/logo.png')}/>
              <Text>{"\n"}</Text>
              <TextInput style={styles.textInput} onChangeText={x => this.setState({email:x})} underlineColorAndroid={'transparent'} placeholder={'email'} type="TextInput"/>
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
        loginError: state.auth.loginError,
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
        setAuthValue,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

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
       top: width < 350 ? 70 : 90,
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
