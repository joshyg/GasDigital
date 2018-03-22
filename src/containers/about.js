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

import Base from './view_base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {colors} from '../constants.js';

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Base header="About Us" navigation={this.props.navigation}>
        <ScrollView>
          <View style={{alignItems: 'center', paddingLeft: 8, paddingRight: 8}}>
            <Text style={styles.text}>
              {
                'We’re fans of entertainment, first and foremost. As such, it’s our mission to bring you the very best content. Our growing brand already includes comedy, music, sports, politics; and it’s all out there for free.\n'
              }
              {'\n'}
              {
                'So why subscribe? All that free content is not released until five days after it’s recorded, and it’s only the beginning of what we offer. For only $7 a month, you get full access to the videos - live and commercial free, as they air. You can join the live chat during the shows and post in the forums, both great ways to connect with other fans AND the hosts of the shows. You get the whole catalogue of archives, over 1,000 hours of your favorite shows, which are not available to the public and can be accessed via our RSS feed, by download, by our Alexa Skill, and Android/iOS app (currently in beta). Speaking of, there is a ton of bonus content created specially for our members only! Plus, if you subscribe with your favorite show’s promo code, you save $1 monthly.\n'
              }
              {'\n'}
              {
                'If you’re still not sure about subscribing, you get a free 14 day trial with that bonus code, and if you don’t love it, cancel at the end of the trial. No harm, no foul. We’re artists, we love what we do, and we want you to love it too.\n'
              }
            </Text>
          </View>
        </ScrollView>
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(About);

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: colors.white,
    fontFamily: 'Avenir',
    textAlign: 'justify',
  },
});
