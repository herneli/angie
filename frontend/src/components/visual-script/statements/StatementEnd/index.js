import StatmentEnd from "./StatmentEnd";
import T from "i18n-react";
import { mdiPlay, mdiStop } from "@mdi/js";

export const registry = {
    name: "visual_script.select_end",
    hidden: true,
    iconPath: mdiStop,
    Component: StatmentEnd,
    create: (manager) => {
        return {
            id: manager.newId(),
            type: "end",
            name: T.translate("visual_script.end"),
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
