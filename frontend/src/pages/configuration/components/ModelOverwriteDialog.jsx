import React, { useState } from "react";
import T from "i18n-react";

import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles((theme) => ({
    checkActionText: {
        color: "black",
        fontSize: "large",
        fontWeight: "bold",
    },
}));

export default function ModelOverwriteDialog({ open, onCheckAction, onClose }) {
    const classes = useStyles();
    const checkActionText = "OVERWRITE";
    const [userText, setUserText] = useState("");
    const [userErrorText, setUserErrorText] = useState(false);

    const verifyActionText = () => {
        if (userText === checkActionText) {
            onCheckAction(true);
        } else {
            setUserErrorText(true);
        }
    };

    const handleOnChangeUserText = (event) => {
        setUserText(event.target.value);
        setUserErrorText(false);
    };
    return (
        <Dialog open={open} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                {T.translate("configuration.confirm")}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {T.translate("configurations.text")}
                </DialogContentText>
                <span className={classes.checkActionText}>
                    {checkActionText}
                </span>
                <TextField
                    error={userErrorText}
                    autoFocus
                    margin="dense"
                    id="name"
                    fullWidth
                    value={userText}
                    onChange={handleOnChangeUserText}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {T.translate("configuration.close")}
                </Button>
                <div style={{ flexGrow: 1 }} />
                <Button onClick={() => onCheckAction(false)} color="primary">
                    {T.translate("configuration.no_overwrite")}
                </Button>
                <Button onClick={verifyActionText} color="primary">
                    {T.translate("configuration.overwrite")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
