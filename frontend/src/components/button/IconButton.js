import Icon from "@mdi/react";
import { Button } from "antd";

const IconButton = (props) => {
    const { icon } = props;

    return <Button {...props} icon={<span className="anticon">
    <Icon {...icon} /></span>} >{props.children}</Button>;
};

export default IconButton;
