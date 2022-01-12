import React, { useState, useEffect } from "react";
import { withRouter, Redirect } from "react-router-dom";

import * as api from "../../api/configurationApi";
import errorHandler from "../../api/errorHandler";
import { usePackage } from "../../components/packages/PackageContext";
import ModelEditor from "./components/ModelEditor";
import ModelTable from "./components/ModelTable";

const ModelAdmin = ({ model, fixedData }) => {
    const [state, setState] = useState({
        modelInfo: null,
        modelData: null,
        edit: null,
        total: null,
        redirectTo: null,
    });
    const packageData = usePackage();
    useEffect(() => {
        search(model);
    }, [model]);

    const search = (modelInfo, filters) => {
        let searchFilters = { ...filters };
        if (packageData) {
            searchFilters[["package_code", "package_version"]] = {
                type: "in",
                value: [[packageData.currentPackage.code, packageData.currentPackage.version]],
            };
        }

        api.getModelInfo(model)
            .then((element) => {
                api.getModelDataList(model, searchFilters).then(
                    (list) => {
                        const modelDataDict = list.reduce((result, model) => {
                            result = { ...result, [model.id]: model };
                            return result;
                        }, {});
                        setState({
                            ...state,
                            edit: null,
                            modelInfo: element,
                            modelData: modelDataDict,
                            total: list.total,
                        });
                    }
                );
            })
            .catch(errorHandler);
    };

    const handleOnClose = () => {
        setState({ ...state, redirectTo: "/" });
    };

    const handleOnDelete = (data) => {
        return api.deleteModelData(model, data.id).then((response) => {
            setState({
                ...state,
                edit: null,
            });
            search(model);
        });
    };

    const setEditData = (data) => {
        return api.getModelData(model, data.id).then((model) => {
            setState({
                ...state,
                edit: model,
            });
        });
    };

    const handleOnSave = (formData, overwrite = false) => {
        return api
            .saveModelData(model, formData, packageData, overwrite)
            .then((model) => {
                search(model);
            })
            .catch(errorHandler);
    };

    const handleOnSaveBatch = (formData, overwrite = false) => {
        return api
            .saveModelData(model, formData, packageData, overwrite)
            .then((model) => {
                return true;
            })
            .catch(errorHandler);
    };

    const addCreateData = (e) => {
        let defaultData = fixedData || {};
        setState({ ...state, edit: { ...defaultData } });
    };

    const { modelInfo, modelData, edit, redirectTo } = state;
    return redirectTo ? (
        <Redirect push={true} to={redirectTo} />
    ) : !modelData ? (
        <h1>Loading...</h1>
    ) : edit ? (
        <ModelEditor
            schema={modelInfo.schema}
            uiSchema={modelInfo.uiSchema}
            data={edit}
            onCancel={() => {
                setState({ ...state, edit: null });
            }}
            onClose={() => {
                setState({ ...state, edit: null });
            }}
            onSave={handleOnSave}
        />
    ) : (
        <ModelTable
            modelInfo={state.modelInfo}
            modelData={Object.values(state.modelData)}
            onAddData={addCreateData}
            onDeleteData={handleOnDelete}
            onEditData={setEditData}
            onSearchData={search}
            onSaveData={handleOnSave}
            total={state.total}
            onSaveDataBatch={handleOnSaveBatch}
        />
    );
};

export default withRouter(ModelAdmin);
