import StatementExpressionGroup from "./StatementExpressionGroup";
import T from "i18n-react";
import { mdiAnimationPlay } from "@mdi/js";

const registry = {
    name: "visual_script.select_expression_group",
    iconPath: mdiAnimationPlay,
    Component: StatementExpressionGroup,
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "expressionGroup",
            name: T.translate("visual_script.new_expression_group"),
            expressions: [],
        };
    },
    schema: (manager) => ({
        type: "object",
        properties: {
            name: { type: "string", title: "Comentario" },
        },
    }),
};

export default registry;
