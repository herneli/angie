import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";
import AceEditorWidget from "./AceEditorWidget";
import ScriptField from "./ScriptField";
// import MultipleSelectWidget from "./MultipleSelectWidget";

const formOptions = {
    widgets: { SelectRemoteWidget, AceEditorWidget /*MultipleSelectWidget*/ },
    fields: { ScriptField },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
