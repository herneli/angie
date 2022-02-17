import React from "react";
import { usePackage } from "../../providers/packages/PackageContext";
import SelectRemoteWidget from "./SelectRemoteWidget";

export default function SelectRemoteWithPackageWidget(props) {
    let packageData = usePackage();
    let newOptions = props.options || {};
    newOptions.filters = {};
    newOptions.filters[["package_code", "package_version"]] = {
        type: "in",
        value: packageData.dependencies,
    };
    let filterProps = { ...props, options: newOptions };
    return <SelectRemoteWidget {...filterProps} />;
}
