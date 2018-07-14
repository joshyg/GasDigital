import _ from 'lodash/fp';
import {DEBUG_LIVE_VIEW, offlineDownloadStatus} from '../constants';
const initialState = {
  channels: [],
  schedule: [],
  channelsById: {},
  channelsByTitle: {},
  rssFeedsById: {},
  lastChannelFetchTime: {},
  episodes: {},
  favoriteEpisodes: {},
  episode: {},
  channelEpisodeIds: {},
  channelBonusEpisodeIds: {},
  recentEpisodeIds: [],
  playlist: [],
  searchResults: [],
  isGettingEpisodes: false,
  isGettingBonusEpisodes: false,
  isGettingSchedule: false,
  isGettingFavorites: false,
  isSettingFavorites: false,
  offlineEpisodes: {},
  liveShowMessage: '',
  page: 1,
  episodeContext: '',
  episodeContextIndex: 0,
};
import {Image} from 'react-native';

payloadError = payload => {
  if (payload.error) {
    return true;
  }
  // based on observation, an episode request that returns nothing will
  // return the string "some thing error", obviously this is not a great way of
  // indicating error, but will try to work with it for now
  if (payload.resp_data && payload.resp_data.data == 'some thing error') {
    return true;
  }
  return false;
};

uniquifyList = list => {
  // uniquify
  let uniqueList = [];
  let iDsDict = {};
  for (iD of list) {
    if (!iDsDict[iD]) {
      iDsDict[iD] = true;
      uniqueList.push(iD);
    }
  }
  return uniqueList;
};

export default (reducer = (state = initialState, action) => {
  let link,
    show_id,
    page,
    channels,
    channelFetchTime,
    channelsById,
    channelsByTitle,
    rssFeedsById,
    episode,
    episodes,
    favoriteEpisodes,
    channelEpisodeIds,
    returnedEpisodes,
    returnedEpisodeIds,
    newPlaylist,
    newOfflineEpisodes,
    id;

  switch (action.type) {
    case 'DATA_SET_VALUE':
      return {...state, ...action.payload};

    case 'DATA_GET_CHANNELS':
      if (payloadError(action.payload)) {
        return {...state};
      }
      channels = action.payload.resp_data.data;
      for (ch in channels) {
        let thumb = channels[ch].thumb;
        if (typeof thumb == 'string') {
          Image.prefetch(channels[ch].thumb)
            .then(_ => {})
            .catch(err => {
              console.log('JG: error prefetching: ', err);
            });
        }
      }
      channelsById = {};
      channelsByTitle = {};
      for (ch in channels) {
        channelsById[channels[ch].id] = channels[ch];
        channelsByTitle[channels[ch].title] = channels[ch];
      }
      return {...state, channelsById, channelsByTitle, channels};

    case 'DATA_GET_SCHEDULE':
      if (payloadError(action.payload)) {
        return {...state, isGettingSchedule: false};
      }
      let schedule = action.payload.resp_data.data;
      if (DEBUG_LIVE_VIEW) {
        const weekdays = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        for (day of weekdays) {
          schedule.push({
            day,
            start_time: '00:00',
            end_time: '23:59',
            show_id: '92',
            show_name: 'The Real Ass Podcast',
          });
        }
      }
      console.log('JG: SCHEDULE = ', schedule);
      return {...state, schedule, isGettingSchedule: false};

    case 'DATA_GET_EPISODES':
      if (payloadError(action.payload)) {
        return {...state, isGettingEpisodes: false};
      }
      link = action.payload.req_data.cat;
      show_id = action.payload.req_data.show_id;
      page = action.payload.req_data.page;
      returnedEpisodes = action.payload.resp_data.data;
      returnedEpisodeIds = returnedEpisodes.map(x => x.id);
      channelEpisodeIds = {};
      if (!state.channelEpisodeIds[link] || page <= 1) {
        channelEpisodeIds[link] = returnedEpisodeIds;
      } else {
        channelEpisodeIds[link] = _.cloneDeep(state.channelEpisodeIds[link]);
        channelEpisodeIds[link] = channelEpisodeIds[link].concat(
          returnedEpisodeIds,
        );
      }

      episodes = {};
      for (i in returnedEpisodes) {
        let episode = returnedEpisodes[i];
        if (!state.episodes[episode.id]) {
          episodes[episode.id] = episode;
          if (action.payload.req_data.prefetch && i <= 10) {
            Image.prefetch(episode.thumbnailUrl)
              .then(_ => {})
              .catch(err => {
                console.log('JG: error prefetching: ', err);
              });
          }
          // FIXME: backend not always returning show id
          if (!episode.show_id) {
            episodes[episode.id].show_id = show_id;
          }
        } else if (!state.episodes[episode.id].show_id) {
          // FIXME: backend not always returning show id
          episodes[episode.id] = _.cloneDeep(state.episodes[episode.id]);
          episodes[episode.id].show_id = show_id;
        }
      }
      channelFetchTime = {};
      // channelFetchTime is meant to throttle
      // fetch on mount, so fetches of latter
      // pages should not reset count.  This caused
      // bugs when latter pages are fetched due to
      // onEndReached
      if (page == 1) {
        channelFetchTime[link] = Date.now() / 1000;
      }

      channelEpisodeIds[link] = uniquifyList(channelEpisodeIds[link]);

      return {
        ...state,
        channelEpisodeIds: {...state.channelEpisodeIds, ...channelEpisodeIds},
        episodes: {...state.episodes, ...episodes},
        lastChannelFetchTime: {
          ...state.lastChannelFetchTime,
          ...channelFetchTime,
        },
        isGettingEpisodes: false,
        page: page,
      };

    case 'DATA_GET_RSS':
      if (payloadError(action.payload)) {
        return {...state, isGettingEpisodes: false};
      }
      const {cat, url, data, err} = action.payload;
      link = action.payload.cat;
      returnedEpisodes = data;
      returnedEpisodeIds = returnedEpisodes.map(x => x.id);
      channelEpisodeIds = {};
      channelEpisodeIds[link] = returnedEpisodeIds;
      episodes = {};
      for (i in returnedEpisodes) {
        let episode = returnedEpisodes[i];
        if (!state.episodes[episode.id]) {
          episodes[episode.id] = episode;
        }
      }
      channelFetchTime = {};
      channelFetchTime[link] = Date.now() / 1000;
      return {
        ...state,
        channelEpisodeIds: {...state.channelEpisodeIds, ...channelEpisodeIds},
        episodes: {...state.episodes, ...episodes},
        lastChannelFetchTime: {
          ...state.lastChannelFetchTime,
          ...channelFetchTime,
        },
        isGettingEpisodes: false,
        page: 1,
      };

    case 'DATA_GETTING_EPISODES':
      return {...state, isGettingEpisodes: true};

    case 'DATA_GET_RECENT_VIDEOS':
      if (payloadError(action.payload)) {
        return {...state};
      }
      episodes = {};
      returnedEpisodeIds = [];
      returnedEpisodes = action.payload.resp_data.data;
      for (i in returnedEpisodes) {
        let episode = returnedEpisodes[i];
        if (!episode.show_id) {
          let channel = state.channelsByTitle[episode.categories];
          episode.show_id = channel && channel.id;
        }

        Image.prefetch(episode.thumbnailUrl)
          .then(_ => {})
          .catch(err => {
            console.log('JG: error prefetching: ', err);
          });

        if (!state.episodes[episode.id]) {
          episodes[episode.id] = episode;
        }
        returnedEpisodeIds.push(episode.id);
      }
      return {
        ...state,
        episodes: {...state.episodes, ...episodes},
        recentEpisodeIds: returnedEpisodeIds,
      };

    case 'DATA_GET_BONUS_CONTENT':
      if (payloadError(action.payload)) {
        return {...state, isGettingBonusEpisodes: false};
      }
      link = action.payload.req_data.category;
      show_id = action.payload.req_data.show_id;
      page = action.payload.req_data.page;
      returnedEpisodes = action.payload.resp_data.result.objects.item;
      if (!returnedEpisodes) {
        return {...state, isGettingBonusEpisodes: false};
      }
      returnedEpisodeIds = returnedEpisodes.map(x => x.id);
      channelEpisodeIds = {};
      if (!state.channelBonusEpisodeIds[link] || page <= 1) {
        channelEpisodeIds[link] = returnedEpisodeIds;
      } else {
        channelEpisodeIds[link] = _.cloneDeep(
          state.channelBonusEpisodeIds[link],
        );
        channelEpisodeIds[link] = channelEpisodeIds[link].concat(
          returnedEpisodeIds,
        );
      }

      episodes = {};
      for (i in returnedEpisodes) {
        let episode = returnedEpisodes[i];
        if (!state.episodes[episode.id]) {
          episodes[episode.id] = episode;
          // FIXME: backend not always returning show id
          if (!episodes[episode.id].show_id) {
            episodes[episode.id].show_id = show_id;
          }
        } else if (!state.episodes[episode.id].show_id) {
          // FIXME: backend not always returning show id
          episodes[episode.id] = _.cloneDeep(state.episodes[episode.id]);
          episodes[episode.id].show_id = show_id;
        }
      }

      channelEpisodeIds[link] = uniquifyList(channelEpisodeIds[link]);

      return {
        ...state,
        channelBonusEpisodeIds: {
          ...state.channelBonusEpisodeIds,
          ...channelEpisodeIds,
        },
        episodes: {...state.episodes, ...episodes},
        isGettingBonusEpisodes: false,
      };

    case 'DATA_GET_LIVE_SHOW':
      if (payloadError(action.payload)) {
        return {...state, liveShowMessage: 'error'};
      }
      /*
        date_added:"2017-05-19 15:34:36"
        liveshowdetail_id:"1"
        room_id:"10"
        showEntryId:"0_b0aykh2u"
        showId:"4207"
        showLink:"https://gasdigitalnetwork.com/api.php?cat=Shame On"
        showLiveUrl:"https://gasdigitalnetwork.com/web.php?fun=livevideo&liveEntryId=0_b0aykh2u"
        showThumb:"https://gasdigitalnetwork.com/wp-content/uploads/2016/09/ShameOnLogo-B-150x150.jpg"
        showTitle:"Shame On"
        */

      if (
        !action.payload.resp_data ||
        !action.payload.resp_data.data ||
        typeof action.payload.resp_data.data != 'object' ||
        action.payload.resp_data.data.length == 0
      ) {
        return {...state, liveShowMessage: action.payload.resp_data.message};
      }

      return {
        ...state,
        liveShowMessage: action.payload.resp_data.message,
        liveShowUrl: action.payload.resp_data.data[0].showLiveUrl,
        liveShowImage: action.payload.resp_data.data[0].showThumb,
        liveShowTile: action.payload.resp_data.data[0].showTile,
        liveShowId: action.payload.resp_data.data[0].showId,
        liveShowEntryId: action.payload.resp_data.data[0].showEntryId,
      };

    case 'DATA_SEARCH':
      if (payloadError(action.payload)) {
        return {...state};
      }
      returnedEpisodes = action.payload.resp_data.data;
      returnedEpisodeIds = returnedEpisodes.map(x => x.id);
      episodes = {};
      for (i in returnedEpisodes) {
        let episode = returnedEpisodes[i];
        if (!state.episodes[episode.id]) {
          episodes[episode.id] = episode;
        }
      }
      return {
        ...state,
        searchResults: returnedEpisodeIds,
        episodes: {...state.episodes, ...episodes},
      };

    case 'DATA_GET_AUDIO':
    case 'PLAYER_PLAY_AUDIO':
      console.log('JG: PLAYER_PLAY_AUDIO, ', action.payload);
      if (payloadError(action.payload)) {
        return {...state};
      }
      const episode_id = action.payload.req_data.vid;
      episode = _.cloneDeep(state.episodes[episode_id]);
      episode.audioUrl = action.payload.resp_data.url;
      episodes = {};
      episodes[episode_id] = episode;
      return {...state, episodes: {...state.episodes, ...episodes}};

    /* Playlists */
    case 'DATA_ADD_FAVORITE':
      const addFaveId = action.payload.req_data.video_id;
      if (!state.episodes[addFaveId]) return {...state};
      episode = _.cloneDeep(state.episodes[addFaveId]);
      episode.is_favourite = true;
      episodes = {};
      favoriteEpisodes = {};
      episodes[addFaveId] = episode;
      favoriteEpisodes[addFaveId] = episode;
      return {
        ...state,
        favoriteEpisodes: {...state.favoriteEpisodes, ...favoriteEpisodes},
        isSettingFavorites: false,
        episodes: {...state.episodes, ...episodes},
      };

    case 'DATA_REMOVE_FAVORITE':
      const removeFaveId = action.payload.req_data.video_id;
      if (!state.episodes[removeFaveId]) return {...state};
      episode = _.cloneDeep(state.episodes[removeFaveId]);
      episode.is_favourite = false;
      episodes = {};
      favoriteEpisodes = _.cloneDeep(state.favoriteEpisodes);
      episodes[removeFaveId] = episode;
      delete favoriteEpisodes[removeFaveId];
      return {
        ...state,
        favoriteEpisodes: {...favoriteEpisodes},
        isSettingFavorites: false,
        episodes: {...state.episodes, ...episodes},
      };

    case 'DATA_GET_FAVORITES':
      returnedEpisodes =
        action.payload.resp_data && action.payload.resp_data.data;
      if (!returnedEpisodes) {
        return {...state};
      }
      returnedEpisodeIds = returnedEpisodes.map(x => x.id);
      episodes = {};
      favoriteEpisodes = {};
      for (i in returnedEpisodes) {
        let episode = returnedEpisodes[i];
        if (!state.episodes[episode.id]) {
          episodes[episode.id] = episode;
        } else {
          episodes[episode.id] = _.cloneDeep(state.episodes[episode.id]);
        }
      }
      for (id of returnedEpisodeIds) {
        if (!episodes[id]) continue;
        episodes[id].is_favourite = true;
        favoriteEpisodes[id] = episodes[id];
      }
      return {
        ...state,
        isGettingFavorites: false,
        favoriteEpisodes: {...state.favoriteEpisodes, ...favoriteEpisodes},
        episodes: {...state.episodes, ...episodes},
      };

    /* Playlists */
    case 'DATA_REMOVE_FROM_PLAYLIST':
      newPlaylist = _.cloneDeep(state.playlist);

      let index = newPlaylist.findIndex(element => {
        return element.id === action.payload.id;
      });

      if (index !== -1) {
        newPlaylist.splice(index, 1);
        return {...state, playlist: newPlaylist};
      }

      return {...state};

    case 'DATA_ADD_TO_PLAYLIST':
      if (!action.payload) {
        return {...state};
      }
      newPlaylist = _.cloneDeep(state.playlist);
      newPlaylist.push(action.payload);

      return {...state, playlist: newPlaylist};

    /* Offline downloading */
    case 'DATA_DISPLAY_OFFLINE_EPISODE_DOWNLOADING_AUDIO':
      newOfflineEpisodes = {};
      id = action.payload.episode.id;
      newOfflineEpisodes[id] = state.offlineEpisodes[id]
        ? state.offlineEpisodes[id]
        : {};
      newOfflineEpisodes[id].status = offlineDownloadStatus.downloading;
      return {
        ...state,
        offlineEpisodes: {...state.offlineEpisodes, ...newOfflineEpisodes},
      };

    case 'DATA_DISPLAY_OFFLINE_EPISODE_DOWNLOADING_VIDEO':
      newOfflineEpisodes = {};
      id = action.payload.episode.id;
      newOfflineEpisodes[id] = state.offlineEpisodes[id]
        ? state.offlineEpisodes[id]
        : {};
      newOfflineEpisodes[id].videoStatus = offlineDownloadStatus.downloading;
      return {
        ...state,
        offlineEpisodes: {...state.offlineEpisodes, ...newOfflineEpisodes},
      };

    case 'DATA_GET_OFFLINE_EPISODE':
      console.log(
        'JG: in DATA_GET_OFFLINE_EPISODE, payload = ',
        action.payload,
      );
      newOfflineEpisodes = {};
      id = action.payload.episode.id;
      newOfflineEpisodes[id] = !!state.offlineEpisodes[id]
        ? state.offlineEpisodes[id]
        : {};
      if (action.payload.status === 'ok') {
        newOfflineEpisodes[id] = !!state.offlineEpisodes[id]
          ? state.offlineEpisodes[id]
          : {};

        if (action.payload.type == 'video') {
          newOfflineEpisodes[id].videoStatus = offlineDownloadStatus.downloaded;
          newOfflineEpisodes[id].videoUrl = action.payload.offline_url;
        } else {
          newOfflineEpisodes[id].status = offlineDownloadStatus.downloaded;
          newOfflineEpisodes[id].audioUrl = action.payload.offline_url;
        }
      } else {
        console.log('JG: offline download error');
        if (action.payload.type == 'video') {
          newOfflineEpisodes[id].videoStatus =
            offlineDownloadStatus.notDownloaded;
        } else {
          newOfflineEpisodes[id].status = offlineDownloadStatus.notDownloaded;
        }
      }
      return {
        ...state,
        offlineEpisodes: {...state.offlineEpisodes, ...newOfflineEpisodes},
      };

    case 'DATA_REMOVE_OFFLINE_EPISODE':
      newOfflineEpisodes = {};
      id = action.payload.episode.id;
      newOfflineEpisodes[id] = !!state.offlineEpisodes[id]
        ? state.offlineEpisodes[id]
        : {};
      if (action.payload.status === 'ok') {
        if (action.payload.type === 'video') {
          newOfflineEpisodes[id].videoStatus =
            offlineDownloadStatus.notDownloaded;
        } else {
          newOfflineEpisodes[id].status = offlineDownloadStatus.notDownloaded;
        }
      }
      return {
        ...state,
        offlineEpisodes: {...state.offlineEpisodes, ...newOfflineEpisodes},
      };

    case 'DATA_REMOVE_CURRENTLY_DOWNLOADING_FILES':
      newOfflineEpisodes = {};
      for (offlineEpisodeId in action.payload.offlineEpisodes) {
        newOfflineEpisodes[offlineEpisodeId] = !!state.offlineEpisodes[
          offlineEpisodeId
        ]
          ? state.offlineEpisodes[offlineEpisodeId]
          : {};
        if (
          newOfflineEpisodes[offlineEpisodeId].status ===
          offlineDownloadStatus.downloading
        ) {
          newOfflineEpisodes[offlineEpisodeId].status =
            offlineDownloadStatus.notDownloaded;
        }
        if (
          newOfflineEpisodes[offlineEpisodeId].videoStatus ===
          offlineDownloadStatus.downloading
        ) {
          newOfflineEpisodes[offlineEpisodeId].videoStatus =
            offlineDownloadStatus.notDownloaded;
        }
      }
      return {
        ...state,
        offlineEpisodes: {...state.offlineEpisodes, ...newOfflineEpisodes},
      };

    case 'DATA_SHOW_MODAL':
      return {
        ...state,
        showModal: true,
        modalData: action.payload.data,
        modalType: action.payload.type,
      };

    case 'AUTH_LOG_OUT':
      return {...initialState, connection: state.connection};
    case 'persist/REHYDRATE':
      return {
        ...initialState,
        ...action.payload.data,
        isGettingEpisodes: false,
        recentEpisodes: [],
        playlist:
          (action.payload.data.playlist &&
            action.payload.data.playlist.filter(x => {
              return !!x;
            })) ||
          [],
      };

    default:
      return state;
  }
  return state;
});
