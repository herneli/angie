import React from "react";
import { Prompt, withRouter } from "react-router";

import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

class PreventTransitionPrompt extends React.Component {
    state = {
        modalVisible: false,
        lastLocation: null,
        confirmedNavigation: false,
    };
    showModal = (location) => {
        const { title, message } = this.props;
        this.setState(
            {
                lastLocation: location,
            },
            () => {
                Modal.confirm({
                    title: title,
                    icon: <ExclamationCircleOutlined />,
                    content: message,
                    onOk: () => {
                        this.handleConfirmNavigationClick();
                    },
                    onCancel() {
                        console.log("Cancel");
                    },
                });
            }
        );
    };

    handleBlockedNavigation = (nextLocation) => {
        const { confirmedNavigation } = this.state;
        const { when } = this.props;
        if (!confirmedNavigation && when) {
            this.showModal(nextLocation);
            return false;
        }

        return true;
    };

    handleConfirmNavigationClick = () => {
        this.setState(
            {
                modalVisible: false,
            },
            () => {
                const { lastLocation } = this.state;
                const { history } = this.props;
                if (lastLocation) {
                    this.setState(
                        {
                            confirmedNavigation: true,
                        },
                        () => {
                            // Navigate to the previous blocked location with your navigate function
                            history.push(lastLocation.pathname);
                        }
                    );
                }
            }
        );
    };

    render() {
        const { when } = this.props;
        return (
            <>
                <Prompt when={when} message={this.handleBlockedNavigation} />
            </>
        );
    }
}

export default withRouter(PreventTransitionPrompt);
