import React, { Component } from "react";
import ScriptManager from "./ScriptManager";
import withStyles from "react-jss";
import ScriptContextProvider from "./ScriptContext";
import Statement from "./statements/Statement";
import { Button, Modal, Space } from "antd";
import ModelAdmin from "../../pages/configuration/ModelAdmin";
import T from "i18n-react";
const styles = {
    dialogContent: {
        marginRight: "10px",
    },
    canvas: {
        position: "relative",
        backgroundColor: "white",
        textAlign: "center",
    },
};

function debounce(fn, ms) {
    let timer;
    return (_) => {
        clearTimeout(timer);
        timer = setTimeout((_) => {
            timer = null;
            fn.apply(this, arguments);
        }, ms);
    };
}
class VisualScript extends Component {
    constructor(props) {
        super(props);
        this.state = {
            manager: null,
            script: props.script,
        };
    }
    componentDidMount() {
        let manager = new ScriptManager(this.props.script, "script-canvas");
        window.addEventListener("resize", this.handleResize);
        this.setState({ ...this.state, manager });
    }

    componentDidUpdate() {
        if (this.props.script && this.state.manager) {
            setTimeout(() => this.repaint(true), 1);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    repaint = (refresh) => {
        this.state.manager && this.state.manager.drawConnections(this.props.script.mainStatement, refresh);
    };
    handleResize = debounce(() => this.repaint(true), 10);
    handleOnChangeStatement = (statement) => {
        this.props.onChange &&
            this.props.onChange({
                ...this.props.script,
                mainStatement: statement,
            });
    };

    handleOnCustomObjects = () => {
        this.setState({ ...this.state, editCustomObjects: true });
    };

    handleOnCancelCustomObjects = () => {
        this.setState({ ...this.state, editCustomObjects: false });
    };

    render() {
        return (
            <>
                {this.state.editCustomObjects ? (
                    <Modal visible={true} width="1000px" onCancel={this.handleOnCancelCustomObjects} footer={false}>
                        <div className={this.props.classes.dialogContent}>
                            <ModelAdmin
                                model="script_object"
                                fixedData={{ customGroup: "script." + this.props.script.code }}
                            />
                        </div>
                    </Modal>
                ) : null}
                <div>
                    <div id="script-canvas" className={this.props.classes.canvas}>
                        {this.state.manager ? (
                            <ScriptContextProvider manager={this.state.manager}>
                                <Statement
                                    statement={this.props.script.mainStatement}
                                    onChange={this.handleOnChangeStatement}
                                />
                            </ScriptContextProvider>
                        ) : null}
                    </div>
                </div>
            </>
        );
    }
}

export default withStyles(styles)(VisualScript);
