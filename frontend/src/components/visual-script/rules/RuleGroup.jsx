import React from "react";
import T from "i18n-react";
import CombinatorSelect from "./CombinatorSelect";
import Rule from "./Rule";
import { createUseStyles } from "react-jss";
import { Button } from "antd";
import { useScriptContext } from "../ScriptContext";
import { mdiDelete } from "@mdi/js";
import StatementIcon from "../statements/StatementIcon";

const useStyles = createUseStyles({
    ruleGroup: {
        margin: "0 0 5px 0",
        "& > $ruleGroup": {
            margin: "0 0 10px 0",
            display: "block",
        },
        padding: "5px 15px",
        "&.all": {
            borderLeft: "3px solid dodgerblue",
        },
        "&.any": {
            borderLeft: "3px dashed dodgerblue",
        },
        "&.simulationSuccess": {
            borderLeft: "3px solid #02dd02",
            "&.any": {
                borderLeftStyle: "dashed",
            },
        },
        "&.simulationFailure": {
            borderLeft: "3px solid #ff4747",
            "&.any": {
                borderLeftStyle: "dashed",
            },
        },
        borderRadius: 0,
        background: "rgba(158, 158, 158, 0.15)",
        textAlign: "left",
        boxShadow: "0 0 2px rgba(0, 0, 0, 0), 0 2px 4px rgba(0, 0, 0, 0.33)",
        display: "inline-block",
    },
    combinatorText: {
        display: "inline-block",
        lineHeight: "32px",
        color: "gray",
    },
    addRuleButton: {
        marginRight: 5,
        float: "right",
        textTransform: "none",
        // backgroundColor: 'dodgerblue',
        color: "dodgerblue",
        fontSize: 12,
    },
    removeGroupButton: {
        marginLeft: 10,
        float: "right",
        padding: 4,
    },

    ruleGroupToolbar: {
        fontSize: 14,
        marginBottom: 15,
    },
    ruleGroupFooter: {
        display: "table",
        fontSize: 14,
        width: "100%",
    },
    ruleWrapper: {
        margin: "5px 0",
    },
    icon: {
        color: "gray",
        fontSize: 14,
        position: "relative",
        top: 4,
        right: 0,
    },
});

export default function RuleGroup({ id, rule, variables, onChange, onDelete }) {
    const classes = useStyles();
    const { manager } = useScriptContext();
    const handleChange = (name) => (value) => {
        onChange({
            ...rule,
            [name]: value,
        });
    };

    const handleAddRule = () => {
        onChange({
            ...rule,
            rules: [
                ...rule.rules,
                { type: "expression", expression: manager.newExpression() },
            ],
        });
    };

    const handleAddGroup = () => {
        onChange({
            ...rule,
            rules: [
                ...rule.rules,
                { type: "group", combinator: "all", rules: [] },
            ],
        });
    };

    const handleRuleItemChange = (index) => (value) => {
        let newRules = [
            ...rule.rules.slice(0, index),
            value,
            ...rule.rules.slice(index + 1),
        ];
        onChange({
            ...rule,
            rules: newRules,
        });
    };

    const handleRuleItemDelete = (index) => () => {
        let newRules = [
            ...rule.rules.slice(0, index),
            ...rule.rules.slice(index + 1),
        ];
        onChange({
            ...rule,
            rules: newRules,
        });
    };

    let ruleComponents = rule.rules.map((rule, index) => {
        return (
            <div key={index} className={classes.ruleWrapper}>
                <Rule
                    key={index}
                    rule={rule}
                    variables={variables}
                    onChange={handleRuleItemChange(index)}
                    onDelete={handleRuleItemDelete(index)}
                />
            </div>
        );
    });

    return (
        <div
            className={
                classes.ruleGroup +
                " " +
                (rule.rules.length > 1 ? rule.combinator : "")
            }
        >
            <div className={classes.ruleGroupToolbar}>
                <div>
                    {rule.rules.length > 1 ? (
                        <span>
                            <CombinatorSelect
                                value={rule.combinator}
                                onChange={handleChange("combinator")}
                            />
                            <span className={classes.combinatorText}>
                                {rule.combinator === "all"
                                    ? T.translate(
                                          "visual_script.all_following_rules_met"
                                      )
                                    : T.translate(
                                          "visual_script.any_following_rules_met"
                                      )}
                            </span>
                        </span>
                    ) : (
                        <span className={classes.combinatorText}>
                            {T.translate("visual_script.following_rules_met")}
                        </span>
                    )}
                    {onDelete ? (
                        <Button
                            className={classes.removeGroupButton}
                            onClick={onDelete}
                            type="text"
                            icon={
                                <StatementIcon
                                    className={classes.icon}
                                    path={mdiDelete}
                                />
                            }
                        />
                    ) : null}
                </div>
            </div>
            {ruleComponents}
            <div className={classes.ruleGroupFooter}>
                <Button
                    type="link"
                    onClick={handleAddGroup}
                    className={classes.addRuleButton}
                >
                    {T.translate("visual_script.add_rule_group").toUpperCase()}
                </Button>
                <Button
                    type="link"
                    onClick={handleAddRule}
                    className={classes.addRuleButton}
                >
                    {T.translate("visual_script.add_rule").toUpperCase()}
                </Button>
            </div>
        </div>
    );
}
