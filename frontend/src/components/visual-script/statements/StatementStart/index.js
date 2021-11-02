import StatmentStart from "./StatmentStart";
import T from "i18n-react";
import { mdiPlay } from "@mdi/js";

export const registry = {
    name: "visual_script.select_start",
    hidden: true,
    iconPath: mdiPlay,
    Component: StatmentStart,
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "start",
            name: T.translate("visual_script.start"),
        };
    },
    schema: (manager) => ({
        type: "object",
        properties: {
            comment: { type: "string", title: "Comentario" },
        },
    }),
};

export default registry;
