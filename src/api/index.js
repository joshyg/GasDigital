import axios from 'axios';
import _ from 'lodash/fp';
import qs from 'query-string';
import {BASE_URL} from '../constants';

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
};

console.log('JG: BASE_URL = ', BASE_URL);
const Api = axios.create({
    baseURL: BASE_URL,
    headers,
    transformRequest: [ data => { if (data) return qs.stringify(data) } ]
});

export default Api;
