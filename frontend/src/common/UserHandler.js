import axios from 'axios';
import KJUR, { b64utoutf8 } from 'jsrsasign'; 

// import b64utoutf8 from ;

export default class UserHandler {

    static async setUser(user) {
        localStorage.removeItem('tokenJWT');
        if (user) {
            try {
                let result = await axios({
                    method: 'post',
                    data: user,
                    url: '/login',
                    headers: {
                        Authorization: undefined,
                        'Content-Type': 'application/json',
                    }
                });
                localStorage.setItem('tokenJWT', result.data.token);
                //if (result.data.token) {
                    // var headerObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(result.data.token.split(".")[0]));
                    // var payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(result.data.token.split(".")[1]));
                    // currentUser = { username: payloadObj.sub, name: payloadObj.sub, profiles: user.profiles };
                //}
            } catch (error) {
                localStorage.removeItem('tokenJWT');
            }
        } else {
            localStorage.removeItem('tokenJWT');
        }
        axios.defaults.headers = {
            Authorization: localStorage.getItem('tokenJWT') ? 'Bearer ' + localStorage.getItem('tokenJWT') : ''
        }
    }


    static getUser() {
        let tokenJWT = localStorage.getItem('tokenJWT');
        if (tokenJWT) {
            let payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(tokenJWT.split(".")[1]));
            return payloadObj.user;
        } else {
            return null;
        }
    }

    static isAuthenticated() {
        let tokenJWT = localStorage.getItem('tokenJWT');
        if (tokenJWT) {
            let payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(tokenJWT.split(".")[1]));
            return (payloadObj.exp && Date.now() <= payloadObj.exp * 1000);
        } else {
            return false;
        }
    }
}
