import _ from 'lodash/fp';

import {NavigationActions, StackNavigator} from 'react-navigation';

import App from '../containers/app';
import Home from '../containers/home';
import Recent from '../containers/recent';
import Login from '../containers/login';
import Search from '../containers/search';
import Episode from '../containers/episode';
import Series from '../containers/series';
import Live from '../containers/live';
import Library from '../containers/library';
import Settings from '../containers/settings';
import PlayerView from '../containers/player_view';
import Playlist from '../containers/playlist';
import Favorites from '../containers/favorites';
import Offline from '../containers/offline';
import About from '../containers/about';

const navigationOptions = {
  gesturesEnabled: true,
};

const RouteConfig = {
  app: {
    screen: App,
    navigationOptions: navigationOptions,
  },
  homescreen: {
    screen: Home,
    navigationOptions: navigationOptions,
  },
  recent: {
    screen: Recent,
    navigationOptions: navigationOptions,
  },
  search: {
    screen: Search,
    navigationOptions: {gesturesEnabled: false},
  },
  library: {
    screen: Library,
    navigationOptions: {gesturesEnabled: false},
  },
  login: {
    screen: Login,
    navigationOptions: navigationOptions,
  },
  episode: {
    screen: Episode,
    navigationOptions: navigationOptions,
  },
  series: {
    screen: Series,
    navigationOptions: navigationOptions,
  },
  favorites: {
    screen: Favorites,
    navigationOptions: navigationOptions,
  },
  offline: {
    screen: Offline,
    navigationOptions: navigationOptions,
  },
  live: {
    screen: Live,
    navigationOptions: {gesturesEnabled: false},
  },
  settings: {
    screen: Settings,
    navigationOptions: {gesturesEnabled: false},
  },
  player_view: {
    screen: PlayerView,
    navigationOptions: navigationOptions,
  },
  playlist: {
    screen: Playlist,
    navigationOptions: navigationOptions,
  },
  about: {
    screen: About,
    navigationOptions: navigationOptions,
  },
};

export const AppNavigator = StackNavigator(RouteConfig, {
  initialRouteName: 'app',
  headerMode: 'none',
});
const initialNavState = AppNavigator.router.getStateForAction(
  AppNavigator.router.getActionForPathAndParams('app'),
);
const initialState = {
  ...initialNavState,
  scene: {},
  toRoute: null, // String: Name of the scene we are navigating to.
  activeMenuItem: 'homescreen',
};

export default (reducer = (state = initialState, action) => {
  // Simply return the original `state` if `nextState` is null or undefined.
  const nextState = AppNavigator.router.getStateForAction(action, state);
  switch (action.type) {
    case NavigationActions.BACK:
      // dont allow user to nav down to first screen, which is app.js
      if (state.routes.length <= 2) {
        return AppNavigator.router.getStateForAction(
          NavigationActions.navigate({routeName: 'homescreen'}),
          state,
        );
      }
      return AppNavigator.router.getStateForAction(action, state);

    case 'CLEAR_NAV_DATA':
      return {
        ...nextState,
        data: null,
      };

    case 'SET_NAV_DATA':
      return {
        ...nextState,
        data: action.payload,
      };

    case 'NAVIGATE_TO':
      // prevent a view from being loaded multiple times in the case 'of a person tapping very fast
      let topRoute = state.routes[state.routes.length - 1];
      if (
        topRoute.routeName === action.payload.scene &&
        topRoute.params.item_id === action.payload.data.item_id
      ) {
        return nextState;
      }
      return AppNavigator.router.getStateForAction(
        NavigationActions.navigate({
          routeName: action.payload.scene,
          params: action.payload.data,
        }),
        {
          ...nextState,
          toRoute: action.payload.scene,
          data: action.payload.data,
        },
      );

    case 'SET_ACTIVE_MENU_ITEM':
      return {
        ...nextState,
        activeMenuItem: action.payload,
      };

    case 'NAVIGATE_RESET_TO':
      if (nextState.routes.length <= 1) {
        return AppNavigator.router.getStateForAction(
          NavigationActions.navigate({routeName: action.payload}),
          nextState,
        );
      }
      tempState = AppNavigator.router.getStateForAction(
        NavigationActions.back({key: state.routes[1].key}),
        nextState,
      );
      return AppNavigator.router.getStateForAction(
        NavigationActions.navigate({routeName: action.payload}),
        tempState,
      );

    case 'persist/REHYDRATE':
      let persistedNavState =
        (action.payload && action.payload.navigation) || {};
      return {
        ...initialState,
        activeMenuItem: 'homescreen',
      };

    default:
      return nextState || state;
  }
});
