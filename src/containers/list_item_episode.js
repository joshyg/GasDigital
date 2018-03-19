import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Alert,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Icon from 'react-native-vector-icons/Entypo';
import {connectActionSheet} from '@expo/react-native-action-sheet';
import {offlineDownloadStatus, colors} from '../constants';
import ThreeDotButton from './three_dot_button';

const {width} = Dimensions.get('window');

@connectActionSheet
class ListItemEpisode extends Component {
  render() {
    const {item} = this.props;
    let description = item && item.description;
    if (typeof description != 'string') {
      description = '';
    }
    if (description.length > 240) {
      description = description.slice(0, 240) + '...';
    }
    return (
      <View>
        <ThreeDotButton
          item={item}
          size={30}
          style={{alignItems: 'flex-end', marginRight: 5}}
        />
        <TouchableOpacity
          style={styles.container}
          onPress={() => {
            this.props.goToEpisode(item);
          }}>
          <View
            style={[
              {
                width: width,
                marginLeft: 5,
              },
            ]}>
            <Text style={styles.title}>{item && item.name}</Text>
            <Text style={styles.description}>{description}</Text>
            {this.props.spinny && (
              <Image
                key="audio"
                style={styles.icon}
                source={require('../../assets/icons/spinny.gif')}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ListItemEpisode);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: width,
    marginBottom: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Avenir',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '900',
    color: colors.yellow,
  },
  description: {
    fontSize: 14,
    color: colors.white,
    fontFamily: 'Avenir',
    fontWeight: '300',
    marginRight: 10,
    textAlign: 'justify',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 20,
    width: 20,
    marginLeft: 5,
  },
});
