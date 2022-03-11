import { Button } from "antd";
import React, { useState } from "react";
import ModelAdmin from "../../configuration/ModelAdmin";

import T from "i18n-react";
import TaskLog from "./TaskLog";

const TasksConfig = () => {
    const [logVisible, setLogVisible] = useState(false);

    const showTaskLog = () => {
        setLogVisible(true);
    };

    const onClose = () => {
        setLogVisible(false);
    };
    return (
        <>
            <Button
                style={{ display: "flex", float: "right", marginLeft: "1.5%" }}
                type="primary"
                onClick={showTaskLog}>
                {T.translate("administration.task_actions.show_task_log")}
            </Button>
            <ModelAdmin
                buttonsConfig={{
                    add: true,
                    uploadTable: true,
                    downloadTable: true,
                    clone: true,
                    download: true,
                }}
                model="task"
            />
            {logVisible && <TaskLog visible={logVisible} onClose={onClose} />}
        </>
    );
};
export default TasksConfig;
