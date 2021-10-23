import React, { Component } from "react";
import ScriptManager from "./ScriptManager";
import withStyles from "react-jss";
import ScriptContextProvider from "./ScriptContext";
import Statement from "./statements/Statement";
const styles = {
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
        if (this.state.script && this.state.manager) {
            setTimeout(() => this.repaint(true), 1);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    repaint = (refresh) => {
        this.state.manager &&
            this.state.manager.drawConnections(
                this.state.script.mainStatement,
                refresh
            );
    };
    handleResize = debounce(() => this.repaint(true), 10);
    handleOnChangeStatement = (statement) => {
        this.setState({
            ...this.state,
            script: { ...this.state.script, mainStatement: statement },
        });
    };

    render() {
        return (
            <div id="script-canvas" className={this.props.classes.canvas}>
                {this.state.manager ? (
                    <ScriptContextProvider manager={this.state.manager}>
                        <Statement
                            statement={this.state.script.mainStatement}
                            onChange={this.handleOnChangeStatement}
                        />
                    </ScriptContextProvider>
                ) : null}
            </div>
        );
    }
}

export default withStyles(styles)(VisualScript);
