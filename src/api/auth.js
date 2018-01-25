import Api from './index';

export function logIn (username,password) {
    console.log("web.php?fun=login&user="+username+"&pass="+password);
    return Api.get("web.php?fun=login&user="+username+"&pass="+password)
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
