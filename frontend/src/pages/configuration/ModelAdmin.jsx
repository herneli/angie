import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import * as api from "../../api/configurationApi";
import errorHandler from "../../api/errorHandler";
import { usePackage } from "../../providers/packages/PackageContext";
import ModelTable from "./components/ModelTable";

const ModelAdmin = ({ buttonsConfig, model }) => {
    const [modelConfig, setModelConfig] = useState({
        modelInfo: null,
        modelData: null,
    });
    const [total, setTotal] = useState(null);

    let history = useHistory();
    const packageData = usePackage();

    useEffect(() => {
        search();
    }, [model]);

    const search = async (filters) => {
        let searchFilters = { ...filters };
        if (packageData) {
            searchFilters[["package_code", "package_version"]] = {
                type: "in",
                value: [[packageData.currentPackage.code, packageData.currentPackage.version]],
            };
        }
        try {
            const modelConfig = await api.getModelInfo(model);
            const list = await api.getModelDataList(model, searchFilters);
            const modelDataDict = list.reduce((result, element) => {
                result = { ...result, [element.id]: element };
                return result;
            }, {});
            setModelConfig({
                modelInfo: modelConfig,
                modelData: modelDataDict,
            });

            setTotal(list.total);
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const handleOnDelete = async (data) => {
        await api.deleteModelData(model, data.id);
        await search();
    };

    const setEditData = async (data) => {
        history.push({
            pathname: `${model}/${data.id}`,
        });
    };

    const handleOnSave = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);
            await search();
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const handleOnSaveBatch = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);
            return true;
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const addCreateData = (e) => {
        history.push({
            pathname: `${model}/new`,
            state: {
                new: true,
            },
        });
    };

    const { modelInfo, modelData } = modelConfig;
    return (
        <div>
            {!modelData && <h1>Loading...</h1>}
            {modelData && (
                <ModelTable
                    modelInfo={modelInfo}
                    buttonsConfig={buttonsConfig}
                    modelData={Object.values(modelData)}
                    onAddData={addCreateData}
                    onDeleteData={handleOnDelete}
                    onEditData={setEditData}
                    onSearchData={search}
                    onSaveData={handleOnSave}
                    total={total}
                    onSaveDataBatch={handleOnSaveBatch}
                />
            )}
        </div>
    );
};

export default ModelAdmin;
