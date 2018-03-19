import _ from 'lodash/fp';
const initialState = {
  timer: {duration: 0, currentTime: 0},
  currentTrack: {},
  isSettingTime: false,
  isFetchingAudio: false,
  queue: [],
  queueIndex: 0,
  episodeProgress: {},
  episodeVideoProgress: {},
  videoTimer: {},
};

export default (reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PLAYER_SET_VALUE':
      return {...state, ...action.payload};

    case 'PLAYER_SET_TIMER':
      let episodeProgress = _.cloneDeep(state.episodeProgress) || {};
      if (action.payload && action.payload.episode_id) {
        episodeProgress[action.payload.episode_id] = action.payload.currentTime;
      }
      return {...state, episodeProgress: episodeProgress};

    case 'PLAYER_SET_VIDEO_TIMER':
      let episodeVideoProgress = {};
      if (action.payload && action.payload.episode_id) {
        episodeVideoProgress[action.payload.episode_id] =
          action.payload.currentTime;
      }
      return {
        ...state,
        episodeVideoProgress: {
          ...state.episodeVideoProgress,
          ...episodeVideoProgress,
        },
        videoTimer: {...state.videoTimer, ...action.payload},
      };

    case 'PLAYER_TOGGLE_PLAYBACK':
      isPlaying = !state.isPlaying;
      return {...state, isPlaying};

    case 'PLAYER_PLAY_AUDIO':
      const currentTrack = _.cloneDeep(state.currentTrack) || {};
      currentTrack.audioUrl = action.payload.resp_data.url;
      return {...state, currentTrack, isPlaying: true};

    case 'PLAYER_PLAY_NEXT':

    case 'PLAYER_PLAY_PREVIOUS':
    default:
      return state;
  }
  return state;
});
