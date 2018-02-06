import { Alert } from 'react-native';
//import { FBLoginManager } from 'react-native-facebook-login';
import { Platform } from 'react-native'


const initialState = { errorMessage: '', user_id: 'logged_out', guest: false, loginError: false };
export default reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'AUTH_LOG_IN':
            console.log("JG: 'AUTH_LOG_IN, action.payload = ", action.payload); 
            var error = action.payload.error;
            if (error) {
               console.log('JG: login error: ', error, action.payload);
                if (action.payload.status < 500) {
                    return { ...state, error: error, errorMessage: 'Error logging in'};
                }

                return { ...state,
                    loginError: true,
                    error: error,
                    errorMessage: 'Internal server error.'
                };
            }

            // Insanely, the server does not respond error when an incorrect email/password is given
            if ( typeof action.payload == 'string' && action.payload.includes('Invalid') ) {
              console.log('login error! state = ', state);
              return { ...state, loginError: true };
            }
            console.log("User logged in to server.",action.payload);
            return { 
              display_name: action.payload.display_name,
              user_id: action.payload.user_id,
              user_email: action.payload.user_email,
              user_image: action.payload.user_image,
              user_name: action.payload.user_name,
              guest: false
            }

    case 'AUTH_LOG_IN_AS_GUEST':
            console.log("User logged in to server as guest");
            return { 
              display_name: 'guest',
              user_id: 0,
              user_email: 'guest@gdn.com',
              // FIXME: Add default guest image
              user_image: '',
              user_name: 'Guesty McGuestFace',
              guest: true
            }

    case 'AUTH_SET_VALUE':
        return { ...state, ...action.payload };

    case 'AUTH_LOG_OUT':
        /*
        FBLoginManager.getCredentials((arg1, arg2) => {
            let data;
            if (Platform.OS === "ios") {
                data = arg2;
            } else {
                data = arg1;
            }

            if (data && data.credentials) {
                FBLoginManager.logout(function(error, data) {
                    if (error) {
                        console.log("Error logging out of Facebook:", error);
                    } else {
                        console.log("Logged out of Facebook")
                    }
                }.bind(this));
            }
        });
        */
        return { ...initialState };

    case 'persist/REHYDRATE':
        console.log("persist rehydrate, auth data = ", action.payload.auth);
        return { ...action.payload.auth };

    default:
        return state;
    }
    return state;
}
