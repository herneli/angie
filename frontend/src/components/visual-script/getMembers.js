import axios from "axios";
export default function getMembers(language, type, options) {
    return axios
        .post(process.env.REACT_APP_SCRIPT_MEMBERS_URL, { language, type, ...options })
        .then((response) => response.data.data);
}
