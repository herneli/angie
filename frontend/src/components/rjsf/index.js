import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";
import SelectRemoteWithPackageWidget from "./SelectRemoteWithPackageWidget";
import AceEditorWidget from "./AceEditorWidget";
import ScriptField from "./ScriptField";
// import MultipleSelectWidget from "./MultipleSelectWidget";

const formOptions = {
    widgets: { SelectRemoteWidget, SelectRemoteWithPackageWidget, AceEditorWidget, SelectRemoteWidget },
    fields: { ScriptField },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
