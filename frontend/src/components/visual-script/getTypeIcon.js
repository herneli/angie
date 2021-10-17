import {
    mdiAlphabetical,
    mdiCalendar,
    mdiCodeBraces,
    mdiContain,
    mdiFunctionVariant,
    mdiNumeric,
    mdiToggleSwitch,
} from "@mdi/js";

const getTypeIcon = (type) => {
    switch (type) {
        case "string":
            return mdiAlphabetical;
        case "date":
            return mdiCalendar;
        case "object":
            return mdiCodeBraces;
        case "array":
            return mdiContain;
        case "number":
        case "integer":
            return mdiNumeric;
        case "boolean":
            return mdiToggleSwitch;
        case "expression":
            return mdiFunctionVariant;
        default:
            return mdiFunctionVariant;
    }
};
export default getTypeIcon;
