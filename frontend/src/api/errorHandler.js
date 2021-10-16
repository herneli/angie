import { message } from "antd";

const errorHandler = (reason) => {
    if (
        reason.response &&
        reason.response.data &&
        reason.response.data.message
    ) {
        message.error(reason.response.data.message);
    } else {
        message.error("Internal Server Error");
    }
};

export default errorHandler;
