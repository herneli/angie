import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";

const formOptions = {
    widgets: { SelectRemoteWidget },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
