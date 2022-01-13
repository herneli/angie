import React, { useState, useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router";

import * as api from "../../api/configurationApi";
import errorHandler from "../../api/errorHandler";
import { usePackage } from "../../components/packages/PackageContext";
import ModelEditor from "./components/ModelEditor";

const ModelEdit = ({ model }) => {
    const [modelConfig, setModelConfig] = useState({
        modelInfo: null,
    });
    const [edit, setEdit] = useState(null);

    const packageData = usePackage();

    let history = useHistory();
    const { state } = useLocation();
    const { id } = useParams();

    useEffect(() => {
        loadModelConfig();
    }, [model]);

    useEffect(() => {
        loadElement();
    }, [state]);

    const loadElement = async () => {
        setEdit(null);

        if (id === "new") {
            setEdit({});
        } else {
            await setEditData(id);
        }
    };

    const loadModelConfig = async () => {
        try {
            const modelConfig = await api.getModelInfo(model);
            setModelConfig({
                modelInfo: modelConfig,
            });
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const setEditData = async (id) => {
        const editModel = await api.getModelData(model, id);
        setEdit(editModel);
    };

    const handleOnSave = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);
            
            history.goBack();
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const { modelInfo } = modelConfig;
    return (
        <div>
            {!modelInfo && <h1>Loading...</h1>}
            {modelInfo && (
                <ModelEditor
                    schema={modelInfo.schema}
                    uiSchema={modelInfo.uiSchema}
                    data={edit}
                    onCancel={() => {
                        history.goBack();
                    }}
                    onClose={() => {
                        setEdit(null);
                    }}
                    onSave={handleOnSave}
                />
            )}
        </div>
    );
};

export default ModelEdit;
