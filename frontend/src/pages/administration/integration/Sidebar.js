import React from "react";

import lodash from "lodash";

import T from "i18n-react";

const Sidebar = ({ nodeTypes }) => {
    /**
     * Evento desencadenado al "arrastrar" un nodo
     * @param {*} event
     * @param {*} nodeType
     * @param {*} extra
     */
    const onDragStart = (event, nodeType, extra) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.setData("application/reactflow/extra", JSON.stringify(extra));
        event.dataTransfer.effectAllowed = "move";
    };

    /**
     * Método encargado de pintar la lista de elementos agrupada
     * @param {*} types
     * @returns
     */
    const drawGroupedTypes = (types) => {
        const sorted = lodash.sortBy(types, "group");
        const grouped = sorted && sorted.length !== 0 ? lodash.groupBy(sorted, "group") : {};

        let result = [];
        for (const group in grouped) {
            let child = grouped[group];

            result.push(
                <div key={group}>
                    <span>{group}</span>
                    <hr />
                    {child.map((type) => (
                        <div
                            key={type.id}
                            className={"dndnode " + type.react_component_type}
                            style={{
                                borderColor: type.custom_color && type.component_border_color,
                                background: type.custom_color && type.component_bg_color,
                            }}
                            onDragStart={(event) =>
                                onDragStart(event, type.code, {
                                    label: type.name,
                                    ...JSON.parse(type.defaults),
                                })
                            }
                            draggable>
                            {type.name}
                        </div>
                    ))}
                </div>
            );
        }

        return result;
    };

    return (
        <aside>
            <div className="description">{T.translate("integrations.channel.sidebar.title")}</div>

            {drawGroupedTypes(nodeTypes)}
        </aside>
    );
};
export default Sidebar;
