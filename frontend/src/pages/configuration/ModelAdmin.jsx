import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";

import * as api from "../../api/configurationApi";
import errorHandler from "../../api/errorHandler";
import ModelEditor from "./components/ModelEditor";
import ModelTable from "./components/ModelTable";

class ModelAdmin extends Component {
    state = {
        modelInfo: null,
        modelData: null,
        edit: null,
        redirectTo: null,
    };

    componentDidMount() {
        api.getModelInfo(this.props.model)
            .then((modelInfo) => {
                api.getModelDataList(this.props.model).then((list) => {
                    const modelDataDict = list.reduce((result, model) => {
                        result = { ...result, [model.id]: model };
                        return result;
                    }, {});
                    this.setState({
                        ...this.state,
                        modelInfo: modelInfo,
                        modelData: modelDataDict,
                    });
                });
            })
            .catch(errorHandler);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.model !== this.props.model) {
            api.getModelInfo(this.props.model)
                .then((modelInfo) => {
                    api.getModelDataList(this.props.model).then((list) => {
                        const modelDataDict = list.reduce((result, model) => {
                            result = { ...result, [model.id]: model };
                            return result;
                        }, {});
                        this.setState({
                            ...this.state,
                            modelInfo: modelInfo,
                            modelData: modelDataDict,
                        });
                    });
                })
                .catch(errorHandler);
        }
    }

    handleOnClose = () => {
        this.setState({ redirectTo: "/" });
    };

    handleOnDelete = (data) => {
        return api
            .deleteModelData(this.props.model, data.id)
            .then((response) => {
                const { [data.id]: _, ...rest } = this.state.modelData;
                this.setState({
                    modelData: { ...rest },
                    edit: null,
                });
            });
    };

    setEditData = (data) => {
        return api.getModelData(this.props.model, data.id).then((model) => {
            this.setState({
                modelData: {
                    ...this.state.modelData,
                    [model.id]: model,
                },
                edit: model,
            });
        });
    };

    handleOnSave = (formData, overwrite = false) => {
        return api
            .saveModelData(this.props.model, formData, overwrite)
            .then((model) => {
                this.setState({
                    modelData: {
                        ...this.state.modelData,
                        [model.id]: model,
                    },
                    edit: null,
                });
            })
            .catch(errorHandler);
    };

    addCreateData = (e) => {
        this.setState({ ...this.state, edit: {} });
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
                onClose={this.handleOnClose}
                onDeleteData={this.handleOnDelete}
                onEditData={this.setEditData}
                onSaveData={this.handleOnSave}
            />
        );
    }
}

export default withRouter(ModelAdmin);
