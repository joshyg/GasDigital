import Api from './index';
import { BASE_URL } from '../constants';

export function GetData(php_file, data) {
    let args = '';
    for ( key in data ) {
      args += key+'='+data[key]+'&'
    }
    return Api.get(php_file+"?"+args)
        .then((res) => {
            return { resp_data: res.data, req_data: data };
        })
        .catch((err) => {
            console.log('JG: err!, BASE_URL = ', BASE_URL, ' args = ', args, ' err = ', err );
            return {
                error: err,
                status: err.response && err.response.status,
            };
        });
}
