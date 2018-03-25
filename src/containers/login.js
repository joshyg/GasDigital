import React from 'react';
import {
  TextInput,
  Text,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setActiveMenuItem, resetTo} from '../actions/navigation';
import {logIn, logInAsGuest, setAuthValue} from '../actions/auth';
import Base from './view_base';
import {colors} from '../constants';
import Orientation from 'react-native-orientation';
import {getSchedule, getChannels, getRecentVideos} from '../actions/data';
import CheckBox from 'react-native-checkbox';

const {height, width} = Dimensions.get('window');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  componentWillMount() {
    if (this.props.remember_me) {
      this.setState({
        email: this.props.user_email,
        password: this.props.password,
      });
    }
    if (
      (this.props.user_id && this.props.user_id != 'logged_out') ||
      this.props.guest
    ) {
      this.props.resetTo('homescreen');
    } else {
      // prefetch data/images
      this.props.getChannels();
      this.props.getSchedule();
      this.props.getRecentVideos(0, 10);
    }
  }

  componentDidMount() {
    Orientation.lockToPortrait();
  }

  componentWillReceiveProps(nextProps) {
    // FIXME: replace user_id with real token when oauth is up
    if (
      (nextProps.user_id && nextProps.user_id != 'logged_out') ||
      nextProps.guest
    ) {
      this.props.resetTo('homescreen');
      this.props.setActiveMenuItem('homescreen');
    }
    if (!this.props.loginError && nextProps.loginError) {
      Alert.alert('Login Error', 'Invalid Email/Password');
      this.props.setAuthValue('loginError', false);
    }
  }

  logIn = () => {
    this.props.logIn(this.state.email, this.state.password);
    if (this.props.remember_me) {
      this.props.setAuthValue('password', this.state.password);
    } else {
      this.props.setAuthValue('password', '');
    }
  };

  logInAsGuest = () => {
    this.props.logInAsGuest();
  };

  render() {
    return (
      <View style={styles.inputContainer}>
        <Image
          style={{height: 80, marginBottom: 10}}
          resizeMode={'contain'}
          source={require('../../assets/images/logo.png')}
        />
        <TextInput
          style={styles.textInput}
          onChangeText={x => this.setState({email: x})}
          value={this.state.email}
          autoCapitalize={'none'}
          underlineColorAndroid={'transparent'}
          placeholder={'email'}
          type="TextInput"
        />
        <TextInput
          style={styles.textInput}
          onChangeText={x => this.setState({password: x})}
          value={this.state.password}
          underlineColorAndroid={'transparent'}
          placeholder={'password'}
          type="TextInput"
          secureTextEntry={true}
        />
        <View style={styles.loginButtons}>
          <TouchableOpacity style={styles.button} onPress={this.logIn}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.logInAsGuest}>
            <Text style={styles.buttonText}>Guest</Text>
          </TouchableOpacity>
        </View>
        <CheckBox
          label="Remember Me"
          checked={this.props.remember_me}
          onChange={checked => {
            let remember_me = !checked;
            this.props.setAuthValue('remember_me', remember_me);
          }}
        />
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
    guest: state.auth.guest,
    user_email: state.auth.user_email,
    password: state.auth.password,
    remember_me: state.auth.remember_me,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      resetTo,
      logIn,
      logInAsGuest,
      getChannels,
      getRecentVideos,
      setAuthValue,
      getSchedule,
      setActiveMenuItem,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
  loginButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: colors.yellow,
    width: 118,
    height: 40,
    justifyContent: 'center',
    padding: 12,
    marginLeft: 5,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: colors.blue,
    fontFamily: 'Avenir',
  },
  inputContainer: {
    borderWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingTop: 120,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.bodyBackground,
    width: width,
    height: height,
    position: 'absolute',
  },
  textInput: {
    backgroundColor: colors.white,
    paddingTop: 10,
    paddingLeft: 10,
    height: 40,
    width: 248,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10,
  },
});
