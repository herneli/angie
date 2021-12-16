import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";

import * as api from "../../api/configurationApi";
import errorHandler from "../../api/errorHandler";
import { usePackage } from "../administration/packages/PackageContext";
import ModelEditor from "./components/ModelEditor";
import ModelTable from "./components/ModelTable";

class ModelAdmin extends Component {
    state = {
        modelInfo: null,
        modelData: null,
        edit: null,
        total: null,
        redirectTo: null,
    };

    componentDidMount() {
        this.search(this.props.model);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.model !== this.props.model) {
            this.search(this.props.model);
        }
    }

    search = (modelInfo, filters) => {
        api.getModelInfo(this.props.model)
            .then((element) => {
                api.getModelDataList(this.props.model, filters, element?.relation_schema, element?.selectQuery).then(
                    (list) => {
                        const modelDataDict = list.reduce((result, model) => {
                            result = { ...result, [model.id]: model };
                            return result;
                        }, {});
                        this.setState({
                            ...this.state,
                            modelInfo: element,
                            modelData: modelDataDict,
                            total: list.total,
                        });
                    }
                );
            })
            .catch(errorHandler);
    };

    handleOnClose = () => {
        this.setState({ redirectTo: "/" });
    };

    handleOnDelete = (data) => {
        return api.deleteModelData(this.props.model, data.id).then((response) => {
            this.setState({
                edit: null,
            });
            this.search(this.props.model);
        });
    };

    setEditData = (data) => {
        return api.getModelData(this.props.model, data.id).then((model) => {
            this.setState({
                edit: model,
            });
            this.search(this.props.model);
        });
    };

    handleOnSave = (formData, overwrite = false) => {
        return api
            .saveModelData(this.props.model, formData, overwrite)
            .then((model) => {
                this.search(this.props.model);
            })
            .catch(errorHandler);
    };

    handleOnSaveBatch = (formData, overwrite = false) => {
        return api
            .saveModelData(this.props.model, formData, overwrite)
            .then((model) => {
                return true;
            })
            .catch(errorHandler);
    };

    addCreateData = (e) => {
        let defaultData = this.props.fixedData || {};
        this.setState({ ...this.state, edit: { ...defaultData } });
    };

    render() {
        const { modelInfo, modelData, edit, redirectTo } = this.state;
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
                    this.setState({ edit: null });
                }}
                onClose={() => {
                    this.setState({ edit: null });
                }}
                onSave={this.handleOnSave}
            />
        ) : (
            <ModelTable
                modelInfo={this.state.modelInfo}
                modelData={Object.values(this.state.modelData)}
                onAddData={this.addCreateData}
                onChangeColumn={this.onChangeColumn}
                onDeleteData={this.handleOnDelete}
                onEditData={this.setEditData}
                onSearchData={this.search}
                onSaveData={this.handleOnSave}
                total={this.state.total}
                onSearchTermChange={this.handleSearchTermChange}
                onSaveDataBatch={this.handleOnSaveBatch}
            />
        );
    }
}

export default withRouter(ModelAdmin);
