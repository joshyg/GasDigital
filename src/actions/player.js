import * as DataApi from "../api/data";

export function togglePlayback(val) {
  return {
    type: "PLAYER_TOGGLE_PLAYBACK"
  };
}

export function fetchAndPlayAudio(channel_id, episode_id) {
  const args = { cat: channel_id, vid: episode_id, audio: true };
  const request = DataApi.GetData("detail.php", args);
  return {
    type: "PLAYER_PLAY_AUDIO",
    payload: request
  };
}

export function playNext() {
  return {
    type: "PLAYER_PLAY_NEXT"
  };
}

export function playPrevious() {
  return {
    type: "PLAYER_PLAY_PREVIOUS"
  };
}

export function setTimerValue(data) {
  return {
    type: "PLAYER_SET_TIMER",
    payload: data
  };
}

export function setVideoTimerValue(data) {
  return {
    type: "PLAYER_SET_VIDEO_TIMER",
    payload: data
  };
}

export function setPlayerValue(key, value) {
  let payload = {};
  payload[key] = value;
  return {
    type: "PLAYER_SET_VALUE",
    payload
  };
}
