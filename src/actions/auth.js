import * as AuthApi from '../api/auth';

export function logIn(username, password) {
  const request = AuthApi.logIn(username, password);

  return {
    type: 'AUTH_LOG_IN',
    payload: request,
  };
}

export function logInAsGuest() {
  return {
    type: 'AUTH_LOG_IN_AS_GUEST',
  };
}

export function logOut(token) {
  const request = AuthApi.logOut(token);

  return {
    type: 'AUTH_LOG_OUT',
  };
}

export function setAuthValue(key, value) {
  let payload = {};
  payload[key] = value;
  return {
    type: 'AUTH_SET_VALUE',
    payload,
  };
}
