import React from "react";
import { Form, Input, message, Modal, Select, notification } from "antd";
import T from "i18n-react";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { useEffect } from "react";
import axios from "axios";

const useStyles = createUseStyles({
    root: { padding: "20px" },
});

export default function PackageNew({ onCancel, onCreate }) {
    const classes = useStyles();
    const [packageData, setPackageData] = useState({ placement: "local" });
    const [remotePackages, setRemotePackages] = useState(null);
    const handleOnChange = (field) => (value) => {
        setPackageData({ ...packageData, [field]: value });
    };

    const placementOptions = [
        { value: "local", label: T.translate("packages.placement_local") },
        { value: "remote", label: T.translate("packages.placement_remote") },
    ];

    useEffect(() => {
        if (!remotePackages) {
            axios.get("/packages/remote_list").then((response) => {
                let options = Object.entries(response.data.data)
                    .filter(([packageCode, packageData]) => !packageData.local)
                    .map(([packageCode, packageData]) => ({
                        label: packageData.name + " (" + packageCode + ")",
                        value: packageCode,
                        item: { ...packageData, code: packageCode },
                    }));
                setRemotePackages(options);
            });
        }
    }, []);

    const handleSavePackage = () => {
        if (packageData.placement === "remote") {
            let data = remotePackages.find((entry) => entry.value === packageData.remotePackage);
            if (!data) {
                message.error(T.translate("packages.remote_package_not_selected"));
                return;
            }
            let { local, ...newPackageData } = data.item;

            axios
                .post("/packages", newPackageData)
                .then((response) => {
                    message.info(T.translate("packages.package_save_successful"));
                    onCreate && onCreate();
                })
                .catch((error) => {
                    notification.error({ message: T.translate("packages.package_save_error") });
                });
        } else {
            if (!packageData.code || !packageData.name) {
                message.info(T.translate("packages.enter_required_fields"));
            }
            let newPackageData = {
                code: packageData.code,
                name: packageData.name,
                remote: packageData.remote,
            };
            axios
                .post("/packages", newPackageData)
                .then((response) => {
                    message.info(T.translate("packages.package_save_successful"));
                    onCreate && onCreate();
                })
                .catch((error) => {
                    notification.error({ message: T.translate("packages.package_save_error") });
                });
        }
    };

    return (
        <Modal visible={true} onCancel={onCancel} onOk={handleSavePackage}>
            <Form layout="vertical" className={classes.root}>
                <Form.Item label={T.translate("packages.placement")}>
                    <Select
                        value={packageData.placement}
                        options={placementOptions}
                        onChange={handleOnChange("placement")}></Select>
                </Form.Item>
                {packageData.placement === "local" ? (
                    <>
                        <Form.Item label={T.translate("packages.code")} required>
                            <Input value={packageData.code} onChange={(e) => handleOnChange("code")(e.target.value)} />
                        </Form.Item>
                        <Form.Item label={T.translate("packages.name")} required>
                            <Input value={packageData.name} onChange={(e) => handleOnChange("name")(e.target.value)} />
                        </Form.Item>
                        <Form.Item label={T.translate("packages.remote")}>
                            <Input
                                value={packageData.remote}
                                onChange={(e) => handleOnChange("remote")(e.target.value)}
                            />
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item label={T.translate("packages.remote_package")}>
                            <Select
                                value={packageData.remotePackage}
                                options={remotePackages}
                                loading={remotePackages === null}
                                onChange={handleOnChange("remotePackage")}></Select>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
}
