import { newInstance, ready } from "@jsplumb/browser-ui";
import { FlowchartConnector } from "@jsplumb/connector-flowchart";
import { v4 as uuidv4 } from "uuid";

import statementRegistry from "./statements/statementRegistry";
import getMembers from "./getMembers";
const arrowOverlay = {
    width: 6,
    length: 6,
    foldback: 0.8,
    location: 1,
};
export default class ScriptManager {
    constructor({ contextMember, language }, containerId) {
        this.contextMember = contextMember;
        this.language = language;
        this.jsplumb = null;
        this.statementRegistry = statementRegistry;
        this.statementClipboard = null;
        ready(() => {
            if (!this.jsplumb) {
                this.jsplumb = newInstance({
                    container: document.getElementById(containerId),
                    connector: {
                        type: FlowchartConnector.type,
                        options: {
                            cornerRadius: 4,
                            midpoint: 1,
                            stub: 10,
                            alwaysRespectStubs: true,
                        },
                    },
                    // anchor: ["Top", "Bottom"],
                    anchor: [
                        [0.5, 0, 0, -1],
                        [0.5, 1, 0, 1],
                    ],
                    endpoint: "Blank",
                    paintStyle: {
                        stroke: "lightgray",
                        strokeWidth: "2px",
                    },
                });
            }
        });
    }

    newId() {
        return uuidv4();
    }

    getStatementRegistry(type) {
        if (type in this.statementRegistry) {
            return this.statementRegistry[type];
        } else {
            throw Error("Statement " + type + " not found");
        }
    }

    getComponent(type) {
        const statementRegistry = this.getStatementRegistry(type);
        return statementRegistry.Component;
    }

    createStatement(type) {
        if (type === "$clipboard") {
            return this.statementClipboard;
        } else {
            const statementRegistry = this.getStatementRegistry(type);
            return statementRegistry.create(this);
        }
    }

    newExpression() {
        return [{ ...this.contextMember }];
    }

    getLanguage() {
        return this.language;
    }

    // getMembers(type, options) {
    //     return getMembers(this.getLanguage(), type, options);
    // }

    getStatementDOMId(statement) {
        return "statement-" + statement.id;
    }

    connect(sourceId, targetId, options = {}) {
        this.jsplumb.connect({
            source: document.getElementById(sourceId),
            target: document.getElementById(targetId),
            ...options,
        });
    }

    createConnectionsSequential(statement) {
        let returnNode;
        let nodes = [];
        let statementId = this.getStatementDOMId(statement);
        if (statement.label) {
            nodes.push({
                initial: statementId + "-label",
                final: statementId + "-label",
            });
        }
        statement.nestedStatements &&
            statement.nestedStatements.forEach(
                function (statement) {
                    nodes.push(this.createConnections(statement));
                }.bind(this)
            );
        if (!statement.main) {
            nodes.push({
                initial: statementId + "-final",
                final: statementId + "-final",
            });
        }
        if (nodes.length > 0) {
            returnNode = {
                initial: nodes[0].initial,
                final: nodes[nodes.length - 1].final,
            };
            if (nodes.length > 1) {
                for (let i = 0; i < nodes.length - 1; i++) {
                    this.connect(nodes[i].final, nodes[i + 1].initial);
                }
            }
        }
        return returnNode;
    }

    createConnectionsParallel(statement, loop) {
        let statementId = this.getStatementDOMId(statement);
        let finalPointId = statementId + "-final";

        if (statement.nestedStatements && statement.nestedStatements.length > 0) {
            statement.nestedStatements.forEach((childStatement) => {
                let parallelNode = this.createConnections(childStatement);
                this.connect(statementId, parallelNode.initial);
                this.connect(parallelNode.final, finalPointId);
                if (loop) {
                    let loopBackId = statementId + "-loop-back";
                    this.connect(finalPointId, loopBackId, {
                        anchor: [
                            [0, 0.5, -1, 0],
                            [0, 0.5, -1, 0],
                        ],
                        // overlays: [{ type: "Arrow", options: arrowOverlay }],
                    });
                    this.connect(loopBackId, statementId, {
                        anchor: [
                            [0, 0.5, 0, 0],
                            // [0, 0.5, 1, 0],
                        ],
                        connector: {
                            type: FlowchartConnector.type,
                            options: { stub: 0 },
                        },
                        overlays: [{ type: "Arrow", options: arrowOverlay }],
                    });
                }
            });

            return { initial: statementId, final: finalPointId };
        } else {
            this.connect(statementId, finalPointId);
            return { initial: statementId, final: finalPointId };
        }
    }

    createConnectionsSingle(statement) {
        let statementId = this.getStatementDOMId(statement);
        return { initial: statementId, final: statementId };
    }

    createConnections(statement) {
        let registry = this.getStatementRegistry(statement.type);
        if (registry.createConnections) {
            return registry.createConnections(this, statement);
        } else {
            return this.createConnectionsSingle(statement);
        }
    }

    resetConnections = () => {
        this.jsplumb.deleteEveryConnection({ force: true });
    };

    drawConnections(statement, reset) {
        ready(() => {
            if (reset) {
                this.resetConnections();
            }
            this.createConnections(statement);
        });
    }

    getFormSchemas(statement, variables) {
        let registry = this.getStatementRegistry(statement.type);
        return {
            schema: (registry.schema && registry.schema(this)) || {},
            uiSchema: (registry.uiSchema && registry.uiSchema(this, variables)) || {},
        };
    }

    setStatementClipboard(statement) {
        this.statementClipboard = statement;
    }
    getStatementClipboard() {
        return this.statementClipboard;
    }
}
