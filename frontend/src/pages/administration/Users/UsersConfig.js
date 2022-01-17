import { Button, Popconfirm } from "antd";
import React, { useState } from "react";
import axios from "axios";
import ModelAdmin from "../../configuration/ModelAdmin";
import Config from "../../../common/Config";

import T from "i18n-react";

const UsersConfig = () => {
    const [loading, setLoading] = useState(false);

    const importUsers = async () => {
        setLoading(true);
        try {
            await axios({
                method: "post",
                url: `/importUsers`,
            });
        } catch (ex) {
            console.error(ex);
        }
        setLoading(false);
    };

    const { url: keyCloakUrl } = Config.getKeycloakConfig();
    //TODO hide add and upload buttons
    return (
        <>
            <Popconfirm title={T.translate("common.question")} onConfirm={importUsers}>
                <Button style={{ display: "flex", float: "right", marginLeft: "1.5%" }} type="primary">
                    {T.translate("administration.user_actions.sync_users")}
                </Button>
            </Popconfirm>
            <Button style={{ display: "flex", float: "left", marginRight: "1.5%" }}>
                <a href={keyCloakUrl + "/admin"} target="_blank" rel="noreferrer">
                    {T.translate("administration.user_actions.manage_users")}
                </a>
            </Button>
            {!loading && (
                <ModelAdmin
                    buttonsConfig={{
                        add: false,
                        uploadTable: false,
                        downloadTable: false,
                        clone: false,
                        download: false,
                    }}
                    model="users"
                />
            )}
            {loading && <div>Realizando importación...</div>}
        </>
    );
};
export default UsersConfig;
