const styles = {
    group: {
        display: "inline-flex",
        flexDirection: "row",
        borderRadius: "3px",
        boxShadow: "0 0 10px rgb(0 0 0 / 28%), 0 0 2px rgb(0 0 0 / 22%)",
        whiteSpace: "nowrap",
        minHeight: "28px",
        fontSize: "14px",
        margin: "2px 10px 2px 0",
    },
    part: {
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
        "& $group": {
            marginLeft: "5px",
        },
        "&.operator": {
            backgroundColor: "dodgerblue",
            color: "white",
            padding: "0px 6px",
        },
    },
    editIcon: {
        color: "gray",
    },
};

export default styles;
