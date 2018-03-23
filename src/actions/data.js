import * as DataApi from '../api/data';
import * as OfflineApi from '../api/offline_api';
import {EPISODES_PER_PAGE} from '../constants';

export function getChannels(user_id = 0) {
  console.log('JG: in getChannels');
  const request = DataApi.GetData('web.php', {
    fun: 'shows',
    user_id: user_id,
  });
  return {
    type: 'DATA_GET_CHANNELS',
    payload: request,
  };
}

export function getSchedule() {
  const request = DataApi.GetData('web.php', {fun: 'schedule'});
  return {
    type: 'DATA_GET_SCHEDULE',
    payload: request,
  };
}

export function getRecentVideos(user_id = 0, perpage = 100) {
  const request = DataApi.GetData('web.php', {
    fun: 'recent_video',
    user_id,
    perpage,
  });
  return {
    type: 'DATA_GET_RECENT_VIDEOS',
    payload: request,
  };
}

export function addToPlaylist(episode) {
  return {
    type: 'DATA_ADD_TO_PLAYLIST',
    payload: episode,
  };
}

export function removeFromPlaylist(episode) {
  return {
    type: 'DATA_REMOVE_FROM_PLAYLIST',
    payload: episode,
  };
}

export function getRecentEpisodes(user_id, channel_id) {
  const request = DataApi.GetData('web.php', {
    fun: 'get_latest_episode',
    u_id: user_id,
    c_id: channel_id,
  });
  return {
    type: 'DATA_GET_RECENT_EPISODES',
    payload: request,
  };
}

export function getEpisodes(
  cat,
  show_id,
  user_id,
  page = 1,
  perpage = EPISODES_PER_PAGE,
  prefetch = false,
) {
  const request = DataApi.GetData('api.php', {
    cat,
    show_id,
    user_id,
    page,
    perpage,
    prefetch,
  });
  return {
    type: 'DATA_GET_EPISODES',
    payload: request,
  };
}

export function gettingEpisodes() {
  return {
    type: 'DATA_GETTING_EPISODES',
  };
}

export function getBonusContent(title, show_id = '') {
  const request = DataApi.GetData('web.php', {
    fun: 'getBonus',
    category: title,
    show_id,
  });
  return {
    type: 'DATA_GET_BONUS_CONTENT',
    payload: request,
  };
}

export function getLiveShow() {
  const request = DataApi.GetData('web.php', {fun: 'liveShowDetail'});
  return {
    type: 'DATA_GET_LIVE_SHOW',
    payload: request,
  };
}

export function search(str, user_id, page = 1, perpage = 20, type = 'episode') {
  const types = {show: 1, episode: 2};
  const request = DataApi.GetData('web.php', {
    fun: 'search',
    str,
    user_id,
    page,
    perpage,
    type: types[type],
  });
  return {
    type: 'DATA_SEARCH',
    payload: request,
  };
}

export function addFavorite(user_id, channel_id, show_id, episode) {
  //"web.php?fun=add_favourite&video_id="+channel_id+"&user_id="+u_id+"&show_id="+c_id
  const args = {fun: 'add_favourite', user_id, show_id, video_id: channel_id};
  if (user_id) {
    const request = DataApi.GetData('web.php', args);
    return {
      type: 'DATA_ADD_FAVORITE',
      payload: request,
    };
  } else {
    return {
      type: 'DATA_ADD_FAVORITE',
      payload: {req_data: args},
    };
  }
}

export function removeFavorite(user_id, channel_id, show_id) {
  //"web.php?fun=remove_favourite&video_id="+channel_id+"&user_id="+u_id+"&show_id="+c_id
  const args = {
    fun: 'remove_favourite',
    user_id,
    show_id,
    video_id: channel_id,
  };
  const request = DataApi.GetData('web.php', args);
  return {
    type: 'DATA_REMOVE_FAVORITE',
    payload: request,
  };
}

export function getFavorites(user_id) {
  //"web.php?fun=get_favourite_videos&user_id="+u_id
  const args = {fun: 'get_favourite_videos', user_id};
  const request = DataApi.GetData('web.php', args);
  return {
    type: 'DATA_GET_FAVORITES',
    payload: request,
  };
}

export function getOfflineEpisode(episode, type) {
  if (type == 'audio' && !episode.audioUrl) {
    const args = {cat: episode.show_id, vid: episode.id, audio: true};
    return DataApi.GetData('detail.php', args)
      .then(x => {
        episode.audioUrl = x.resp_data.url;
        const request = OfflineApi.saveOfflineTrack(episode, type);
        return {
          type: 'DATA_GET_OFFLINE_EPISODE',
          payload: request,
        };
      })
      .catch(err => {
        return {
          type: 'DATA_GET_OFFLINE_EPISODE',
          payload: {error: err, episode, type},
        };
      });
  } else {
    const request = OfflineApi.saveOfflineTrack(episode, type);
    return {
      type: 'DATA_GET_OFFLINE_EPISODE',
      payload: request,
    };
  }
}

export function displayOfflineEpisodeDownloading(episodeObject, type) {
  return {
    type:
      type === 'audio'
        ? 'DATA_DISPLAY_OFFLINE_EPISODE_DOWNLOADING_AUDIO'
        : 'DATA_DISPLAY_OFFLINE_EPISODE_DOWNLOADING_VIDEO',
    payload: {episode: episodeObject},
  };
}

export function deleteOfflineEpisode(
  episodeObject,
  offline_url,
  type = 'video',
) {
  const request = OfflineApi.removeOfflineTrack(
    episodeObject,
    offline_url,
    type,
  );
  return {
    type: 'DATA_REMOVE_OFFLINE_EPISODE',
    payload: request,
  };
}

export function deleteCurrentlyDownloadingFiles(offlineEpisodes) {
  const request = OfflineApi.deleteCurrentlyDownloadingFiles(offlineEpisodes);
  return {
    type: 'DATA_REMOVE_CURRENTLY_DOWNLOADING_FILES',
    payload: request,
  };
}

export function getAudio(channel_id, episode_id) {
  //https://gasdigitalnetwork.com/detail.php?vid=0_7e02jg7r&cat=High Society Radio&audio=true
  const args = {cat: channel_id, vid: episode_id, audio: true};
  const request = DataApi.GetData('detail.php', args);
  return {
    type: 'DATA_GET_AUDIO',
    payload: request,
  };
}

export function showModal(type = '', data = null) {
  return {
    type: 'DATA_SHOW_MODAL',
    payload: {type, data},
  };
}

export function setValue(key, value) {
  let payload = {};
  payload[key] = value;
  return {
    type: 'DATA_SET_VALUE',
    payload,
  };
}

export function getRSS(cat, url) {
  let payload = DataApi.getRSS(cat, url);
  return {
    type: 'DATA_GET_RSS',
    payload,
  };
}
