export const NAVIGATE_TO = 'NAVIGATE_TO';
export const NAVIGATION_BACK = 'NAVIGATION_BACK';
export const SET_ACTIVE_MENU_ITEM = 'SET_ACTIVE_MENU_ITEM';
export const NAVIGATE_RESET_TO = 'NAVIGATE_RESET_TO';
export const NAVIGATE_MODAL_TOGGLE = 'NAVIGATE_MODAL_TOGGLE';

export const navigateTo = (scene, data) => {
    return {
        type: NAVIGATE_TO,
        payload: { scene, data }
    };
};

export const setActiveMenuItem = (menuItem) => {
    return {
        type: SET_ACTIVE_MENU_ITEM,
        payload: menuItem
    };
};


export const back = (removedRoute) => {
    return {
        type: NAVIGATION_BACK,
        payload: removedRoute
    };
};

export const resetTo = (route) => {
    return {
        type: NAVIGATE_RESET_TO,
        payload: route
    }
};


export function toggleModal(data, type) {
    return {
        type: NAVIGATE_MODAL_TOGGLE,
        payload: { type, data }
    };
}
