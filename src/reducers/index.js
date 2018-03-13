import { combineReducers } from "redux";

import navigation from "./navigation";
import auth from "./auth";
import storage from "./storage";
import data from "./data";
import player from "./player";

const rootReducer = combineReducers({
  navigation,
  auth,
  storage,
  data,
  player
});

export default rootReducer;
