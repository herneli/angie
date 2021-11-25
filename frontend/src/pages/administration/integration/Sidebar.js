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
        const sorted = lodash.sortBy(types, "data.group");
        const grouped = sorted && sorted.length !== 0 ? lodash.groupBy(sorted, "data.group") : {};

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
                            className={"dndnode " + type.data.react_component_type}
                            onDragStart={(event) =>
                                onDragStart(event, type.id, {
                                    label: type.data.name,
                                    ...JSON.parse(type.data.defaults),
                                })
                            }
                            draggable>
                            {type.data.name}
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
