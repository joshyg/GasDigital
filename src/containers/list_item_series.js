import React from 'react';
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
import {colors} from '../constants';

const {width} = Dimensions.get('window');

export default function ListItemSeries(props) {
  const {item} = props;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        props.goToSeries(item);
      }}>
      <Image
        style={styles.thumbnail}
        source={{
          uri: item.thumb,
          cache: 'force-cache',
        }}
      />
    </TouchableOpacity>
  );
}

console.log('JG: width = ', width);
const iconWidth = width >= 400 ? 170 : width >= 375 ? 150 : 130;
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: iconWidth + 10,
    width: width / 2,
    paddingBottom: 5,
    marginTop: width > 400 ? 15 : 10,
    marginBottom: 5,
    alignItems: 'center',
    backgroundColor: colors.bodyBackground,
  },
  thumbnail: {
    width: iconWidth,
    height: iconWidth,
    marginLeft: 15,
    borderRadius: 15,
  },
  title: {
    fontSize: 20,
  },
});
