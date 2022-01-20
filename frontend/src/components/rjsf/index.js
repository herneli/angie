import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";
import SelectRemoteWithPackageWidget from "./SelectRemoteWithPackageWidget";
import AceEditorWidget from "./AceEditorWidget";
import ScriptField from "./ScriptField";
import SwitchField from "./SwitchField";
import ColorField from "./ColorField";

const formOptions = {
    widgets: {
        SelectRemoteWidget,
        SelectRemoteWithPackageWidget,
        ColorField,
        CheckboxWidget: SwitchField, //Se sobreescribe el checkbox ya que no se puede personalizar un boolean
        AceEditorWidget,
    },
    fields: { ScriptField },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
