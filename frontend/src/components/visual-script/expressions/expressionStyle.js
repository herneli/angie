const styles = {
    expression: {
        display: "inline-block",
        whiteSpace: "nowrap",
    },
    group: {
        display: "inline-flex",
        flexDirection: "row",
        borderRadius: "3px",
        boxShadow: "0 0 6px rgb(0 0 0 / 28%), 0 0 2px rgb(0 0 0 / 22%)",
        whiteSpace: "nowrap",
        // minHeight: "28px",
        // fontSize: "14px",
        fontSize: "12px",
        margin: "2px 5px 2px 0",
    },
    member: {
        display: "flex",
        position: "relative",
        border: "none",
        borderRadius: 0,
        borderRight: "1px solid rgba(34,36,38,.29)",
        backgroundColor: "#fff",
        padding: "2px 12px 2px  20px",
        alignItems: "center",
        verticalAlign: "middle",

        "&:first-child": {
            borderRadius: "3px 0 0 3px;",
            paddingLeft: "6px",
        },
        "&:last-child": {
            borderRadius: "0 3px 3px 0",
            borderRight: "none",
        },
        "&:only-child": {
            borderRadius: "3px",
        },

        "&:after": {
            display: "block",
            top: "50%",
            right: -1,
            content: "''",
            position: "absolute",
            width: "12px",
            height: "12px",
            borderStyle: "solid",
            borderWidth: "0 1px 1px 0",
            borderColor: "rgba(34,36,38,.29)",
            zIndex: 2,
            transform: "translateY(-50%) translateX(50%) rotate(-45deg)",
            backgroundColor: "#fff",
        },
        "&:last-child:after": {
            display: "none",
        },
        "&.method, &.method:after": {
            backgroundColor: "#ffce54",
        },
        "&.method.red, &.method.red:after": {
            backgroundColor: "#dd897b",
        },
        "&.method.white, &.method.red:after": {
            backgroundColor: "white",
        },
        "&.method.green, &.method.green:after": {
            backgroundColor: "#a0d468",
        },

        "& $group": {
            marginLeft: "5px",
        },
        "&.operator": {
            backgroundColor: "dodgerblue",
            color: "white",
            padding: "0px 6px",
        },
        "&.operator.boolean": {
            cursor: "pointer",
        },
        "&.selector": {
            padding: "2px 2px 2px 6px",
        },
    },
    selector: {
        position: "relative",
        width: "50px",
        marginRight: "-50px",
        zIndex: 1,
    },
    editIcon: {
        color: "gray",
        marginLeft: 8,
    },
    memberSelectorWrapper: {
        minWidth: "300px",
        maxHeight: "300px",
        overflow: "auto",
    },
    memberSelectorListItem: {
        cursor: "pointer",
    },
    selectorButton: {
        height: "16px",
        width: "16px",
    },
};

export default styles;
