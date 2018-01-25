import RNFetchBlob from 'react-native-fetch-blob'
import { offlineDownloadStatus } from '../constants';
import { AsyncStorage } from 'react-native';

export function saveOfflineTrack(episode,type="video") {
    console.log(`saving episode ${episode.id} to storage`);
    let downloadUrl = episode.downloadUrl;
    if ( type == "audio" && episode.audioUrl ) {
      downloadUrl = episode.audioUrl;
      console.log('JG: downloadUrl for audio = ', downloadUrl );
    }
    let suffix = type == 'audio' ? 'mp3' : 'mp4'
    return RNFetchBlob.config({
        fileCache : true,
        path: RNFetchBlob.fs.dirs.CacheDir + `/episodes/${episode.id}-${type}.${suffix}`,
    })
    .fetch('GET', downloadUrl, {
        //some headers
    })
    .then((res) => {
        offline_url = res.path();
        console.log("SUCCESS finishing download of offline episode " + episode.id);
        return {episode, type, offline_url, status: 'ok'};
    }).catch((err) => {
        console.log("ERROR starting to download offline episode " + episode.id, err);
        return {episode, type, offline_url, status: 'error', error: err};
    });
}

export function removeOfflineTrack(episode,offline_url,type="video") {
    console.log(`deleting offline episode ${episode.id} from storage`);
    let filePath = offline_url;
    return RNFetchBlob.fs.unlink(filePath)
    .then(() => {
        console.log("SUCCESS deleting offline episode " + episode.id);
        return {episode, type, status: 'ok'};
    }).catch((err) => {
        console.log("ERROR deleting offline episode " + episode.id, err);
        return {episode, type, status: 'error', error: err};
    });
}

export function deleteCurrentlyDownloadingFiles(offlineEpisodes) {
    const promises = [];
    for (id in offlineEpisodes) {
        if (!!offlineEpisodes[id].videoUrl) {
            if (offlineEpisodes[id].videoStatus === offlineDownloadStatus.downloading) {
                promises.push(removeOfflineTrack(
                    {id: id}, 
                    offlineEpisodes[id].videoUrl
                ));                
            }
        } else {
            if (offlineEpisodes[id].status === offlineDownloadStatus.downloading) {
                promises.push(removeOfflineTrack(
                    {id: id}, 
                    offlineEpisodes[id].audioUrl
                ));
            }
        }
    }

    return Promise.all(promises)
    .then(() => {
        console.log("SUCCESS deleting all downloading episodes ");
        return {offlineEpisodes, status: 'ok'};
    }).catch((err) => {
        console.log("ERROR deleting offline episodes", err);
        return {offlineEpisodes, status: 'error', error: err};
    });    
}
