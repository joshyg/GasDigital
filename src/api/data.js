import Api from "./index";
import { APP_VERSION, BASE_URL } from "../constants";
import axios from "axios";
import qs from "query-string";
var xml2js = require("xml2js");

export function GetData(php_file, data) {
  let args = "";
  for (key in data) {
    args += key + "=" + data[key] + "&";
  }
  args += "app_version=" + APP_VERSION;
  return Api.get(php_file + "?" + args)
    .then(res => {
      return { resp_data: res.data, req_data: data };
    })
    .catch(err => {
      console.log(
        "JG: err!, BASE_URL = ",
        BASE_URL,
        " args = ",
        args,
        " err = ",
        err
      );
      return {
        error: err,
        status: err.response && err.response.status
      };
    });
}

export function getRSS(cat, url) {
  const args = { cat, url };
  var parser = new xml2js.Parser();
  return axios
    .get(url)
    .then(response => {
      let data;
      let err;
      parser.parseString(response.data, (error, result) => {
        err = error;
        let jsonResult = result.rss.channel[0].item;
        data = jsonResult.map(x => {
          let description = x.description[0].replace(/<(?:.|\n)*?>/gm, "");
          let episode = {
            id: x.guid[0]._,
            name: x.title[0],
            dataUrl: x.enclosure[0]["$"].url,
            audioUrl: x.enclosure[0]["$"].url,
            downloadUrl: x.enclosure[0]["$"].url,
            thumbnailUrl: x["itunes:image"][0]["$"].href,
            description: description
          };
          return episode;
        });
        return data;
      });
      return { ...args, data, err };
    })
    .catch(error => {
      console.log("JG: error = ", error);
      return { ...args, err: error };
    });
}
