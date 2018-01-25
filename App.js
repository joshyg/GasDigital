/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import GasDigital from './src';
import codePush from "react-native-code-push";
import { Crashlytics } from 'react-native-fabric';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


//change console.log to use Crashlytics.log in production
console.devLog = console.log;
console.log = function() {
    let args = Array.prototype.slice.call(arguments);
    if (__DEV__) {
        this.devLog.apply(this, args);
    } else {
        Crashlytics.log(args.map((x) => { return JSON.stringify(x)}).join(' '));
    }
}.bind(console);

class App extends Component<{}> {
  render() {
    return (
        <GasDigital/>
    );
  }
}

if ( ! __DEV__ ) {
  cpArgs = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };
  App = codePush(cpArgs)(App);
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
