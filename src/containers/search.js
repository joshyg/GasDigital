import React from 'react';
import {
  Text,
  TextInput,
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
import {resetTo, navigateTo} from '../actions/navigation';
import Base from './view_base';
import {search, setValue} from '../actions/data';
import _ from 'underscore';
import EpisodeList from './episode_list';
import {colors} from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';
const {height, width} = Dimensions.get('window');

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textEmpty: true,
    };
  }

  componentWillReceiveProps(nextProps) {}

  componentDidMount() {
    this.props.setValue('episodeContext', 'search');
    this.props.setValue('series', {});
  }

  search = text => {
    let endState = {};
    this.props.search(text, this.props.user_id);
    if (text == '') {
      this.setState({textEmpty: true});
    } else if (this.state.textEmpty) {
      this.setState({textEmpty: false});
    }
  };

  render() {
    return (
      <Base navigation={this.props.navigation}>
        <TextInput
          style={styles.inputContainer}
          onChangeText={_.debounce(this.search, 300)}
          underlineColorAndroid={'transparent'}
          placeholder={'Search'}
          placeholderTextColor={colors.yellow}
          value={this.state.text}
        />
        <Text>{'\n'}</Text>
        {this.props.searchResults.length > 0 && !this.state.textEmpty ? (
          <View style={styles.episodesContainer}>
            <EpisodeList
              data={this.props.searchResults.map(x => this.props.episodes[x])}
            />
          </View>
        ) : (
          <View style={styles.noResultsStyle}>
            <Icon name={'search'} size={120} color={colors.yellow} />
            <Text>{'\n'}</Text>
            <Text style={styles.header}>Search GaS Digital</Text>
            <Text style={styles.subHeader}>
              Find your favorite episode, show, host or guest
            </Text>
          </View>
        )}
      </Base>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: state.auth.user_id,
    searchResults: state.data.searchResults,
    channels: state.data.channels,
    channelEpisodeIds: state.data.channelEpisodeIds,
    isGettingEpisodes: state.data.isGettingEpisodes,
    episodes: state.data.episodes,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      resetTo,
      navigateTo,
      setValue,
      search,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);

let inputMarginTop = height >= 800 ? 35 : 10;
const styles = StyleSheet.create({
  inputContainer: {
    margin: 10,
    marginTop: inputMarginTop,
    paddingLeft: 10,
    paddingRight: 10,
    height: 36,
    backgroundColor: colors.grey5,
    borderRadius: 10,
    color: colors.yellow,
  },
  noResultsStyle: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  episodesContainer: {
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 20,
    fontFamily: 'Avenir',
    color: colors.yellow,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontFamily: 'Avenir',
    color: colors.buttonGrey,
    textAlign: 'center',
  },
});
