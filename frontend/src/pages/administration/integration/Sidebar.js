import React, { useState } from "react";

import lodash from "lodash";

import T from "i18n-react";

import { Collapse } from "antd";
import BasicFilter from "../../../components/basic-filter/BasicFilter";

const { Panel } = Collapse;

const Sidebar = ({ nodeTypes }) => {
    const [nodes, setNodes] = useState(nodeTypes);

    /**
     * Función que filtra los nombres de la lista de nodos
     * @param {*} term -
     * @returns
     */
    const filterNodes = (term) => {
        return nodeTypes.filter((node) => {
            return node.name.toLowerCase().includes(term);
        });
    };

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
                <Panel header={group} key={group} className="avoid-selection">
                    {child.map((type) => (
                        <div
                            key={type.id}
                            className={"avoid-selection dndnode " + type.react_component_type}
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
                </Panel>
            );
        }

        return result;
    };

    return (
        <aside>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid lightgrey",
                }}>
                <span className="description avoid-selection">{T.translate("integrations.channel.sidebar.title")}</span>
                <BasicFilter
                    hideDateFilter
                    size="small"
                    onSearch={(e) => {
                        const term = e.filter.toLowerCase();
                        if (term) {
                            const filteredNodes = filterNodes(term);
                            setNodes(filteredNodes);
                        } else {
                            setNodes(nodeTypes);
                        }
                    }}
                />
            </div>
            <Collapse ghost={true}>{drawGroupedTypes(nodes)}</Collapse>
        </aside>
    );
};
export default Sidebar;
