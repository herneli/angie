import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";
import AceEditorWidget from "./AceEditorWidget";
import ScriptField from "./ScriptField";
import SwitchField from "./SwitchField";
// import MultipleSelectWidget from "./MultipleSelectWidget";

const formOptions = {
    widgets: {
        SelectRemoteWidget,
        AceEditorWidget,
        CheckboxWidget: SwitchField, //Se sobreescribe el checkbox ya que no se puede personalizar un boolean
        /*MultipleSelectWidget*/
    },
    fields: { ScriptField },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
