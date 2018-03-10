import Api from './index';
import { APP_VERSION, BASE_URL } from '../constants';

export function logIn (username,password) {
    let url = "web.php?fun=login&user="+encodeURIComponent(username)+"&pass="+encodeURIComponent(password)+"&app_version="+APP_VERSION;
    return Api.get(url)
        .then((res) => {
            console.log("JG: logged in, response = ", res);
            return res.data.data;
        })
        .catch((err) => {
            console.log("JG: error logging in", err);
            return {
                error: err,
                status: err.response && err.response.status,
            };
        });
}


export function logOut (token) {
}
