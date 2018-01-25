import { persistStore, autoRehydrate } from 'redux-persist';
import { applyMiddleware, createStore } from 'redux';
import { AsyncStorage } from 'react-native';
import ReduxPromise from 'redux-promise';
import rootReducer from './reducers';

timerUpdate = (action) => {
  if ( action.type == "PLAYER_SET_VALUE" ) {
    for ( key of Object.keys(action.payload) ) {
      if ( key == "timer" || key == "videoTimer" ) {
        return true;
      }
    }
  }
}

var logger = ({ getState }) => (next) => (action) => {
    if (action.type === 'PLAYER_SET_TIMER') {
        return next(action);
    }

    let logEntry = {};
    logEntry.action = action.type;

    let startedTime = Date.now();
    try {
        next(action);
    } catch (e) {
        logEntry.error = e;
        // e.stack ? console.log(e.stack) : (console.trace && console.trace());
    }
    logEntry.duration = Date.now() - startedTime;

    if (action.type != 'persist/REHYDRATE'&& action.type != 'NOOP' && 
        ! timerUpdate(action) ) {
        console.log(logEntry);
    }
}

const middleware = applyMiddleware(ReduxPromise, logger);
        
const store = autoRehydrate()(createStore)(rootReducer, middleware);
persistStore(store, { storage: AsyncStorage });
    
export default store; 
