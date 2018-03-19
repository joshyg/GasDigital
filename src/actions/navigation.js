export const navigateTo = (scene, data) => {
  return {
    type: "NAVIGATE_TO",
    payload: { scene, data }
  };
};

export const setActiveMenuItem = menuItem => {
  return {
    type: "SET_ACTIVE_MENU_ITEM",
    payload: menuItem
  };
};

export const back = removedRoute => {
  return {
    type: "NAVIGATION_BACK",
    payload: removedRoute
  };
};

export const resetTo = route => {
  return {
    type: "NAVIGATE_RESET_TO",
    payload: route
  };
};
