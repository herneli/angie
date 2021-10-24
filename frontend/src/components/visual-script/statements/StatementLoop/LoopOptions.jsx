import React, { Component } from "react";
import Expression from "../../expressions/Expression";
import registry from ".";
import { createUseStyles } from "react-jss";
import { Col, Row } from "antd";
import StatementIcon from "../StatementIcon";

const useStyles = createUseStyles({
    root: {
        margin: "5px 10px 5px 10px",
        padding: "2px 10px 5px 20px",
        minWidth: 450,
        borderRadius: 0,
        background: "rgba(158, 158, 158, 0.15)",
        textAlign: "left",
        boxShadow: "0 0 2px rgba(0, 0, 0, 0), 0 2px 4px rgba(0, 0, 0, 0.33)",
        display: "inline-block",
    },
    title: {
        display: "inline-block",
        lineHeight: "32px",
        color: "gray",
    },
    titleIcon: {
        fontSize: 18,
        marginRight: 10,
        position: "relative",
        top: 4,
    },

    removeButton: {
        marginLeft: 10,
        float: "right",
        padding: 10,
    },
    variables: {
        verticalAlign: "bottom",
    },
    toolbar: {
        fontSize: 14,
        marginBottom: 8,
    },
    footer: {
        display: "table",
        fontSize: 14,
        marginTop: 5,
        width: "100%",
    },
    into: {
        margin: "0 30px 5px 30px",
        color: "dodgerblue",
    },
    itemName: {},
    icon: {
        color: "gray",
        marginRight: "10px",
        fontSize: 14,
        position: "relative",
        top: 4,
    },
});

export default function LoopOptions({ id }) {
    const classes = useStyles();
    return (
        <div id={id} className={classes.root}>
            <div className={classes.toolbar}>
                <div>
                    <span className={classes.title}>
                        <StatementIcon
                            className={classes.icon}
                            path={registry.iconPath}
                        />
                        <span>Repeat</span>
                    </span>
                </div>
                <Row>
                    <Col>Loop options</Col>
                </Row>
            </div>
        </div>
    );
}
