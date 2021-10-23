import StatementComment from "./StatementComment";
import T from "i18n-react";
import { mdiComment } from "@mdi/js";

export const registry = {
    name: "visual_script.select_comment",
    iconPath: mdiComment,
    Component: StatementComment,
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "comment",
            name: T.translate("visual_script.new_comment"),
            comment: T.translate("visual_script.new_comment"),
        };
    },
};

export default registry;
