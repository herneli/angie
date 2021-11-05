import StatementComment from "./StatementComment";
import T from "i18n-react";
import { mdiCommentOutline } from "@mdi/js";

export const registry = {
    name: "visual_script.select_comment",
    iconPath: mdiCommentOutline,
    Component: StatementComment,
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "comment",
            name: T.translate("visual_script.new_comment"),
            comment: T.translate("visual_script.new_comment"),
        };
    },
    schema: (manager, variables) => ({
        type: "object",
        properties: {
            comment: { type: "string", title: "Comentario" },
        },
    }),

    uiSchema: (manager, variables) => ({}),
};

export default registry;
