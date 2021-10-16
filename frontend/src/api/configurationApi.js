import axios from "axios";

function frontendModelData(modelData) {
    const extendedData = {
        ...modelData.data,
        id: modelData.id,
        created_at: modelData.created_at,
        modified_at: modelData.modified_at,
    };
    return extendedData;
}

function backendModelData(extendedData) {
    const { created_at, modified_at, ...modelData } = extendedData;
    return modelData;
}

export function getModelInfo(model) {
    return axios.get("/configuration/model/" + model, {}).then((response) => {
        return response.data.data.data;
    });
}

export function getModelDataList(model) {
    return axios
        .get("/configuration/model/" + model + "/data")
        .then((response) => {
            return response.data.data.map((modelData) =>
                frontendModelData(modelData)
            );
        });
}

export function getModelData(model, id) {
    return axios
        .get("/configuration/model/" + model + "/data/" + id.toString())
        .then((response) => {
            return frontendModelData(response.data.data);
        });
}

export function deleteModelData(model, id) {
    return axios
        .delete("/configuration/model/" + model + "/data/" + id.toString())
        .then((response) => {
            return response.data.data;
        });
}

export function saveModelData(model, extendedData, overwrite = false) {
    const data = backendModelData(extendedData);

    if (extendedData.id) {
        return axios
            .put(
                "/configuration/model/" +
                    model +
                    "/data/" +
                    extendedData.id.toString(),
                data
            )
            .then((response) => frontendModelData(response.data.data));
    } else {
        return axios
            .post("/configuration/model/" + model + "/data/", data)
            .then((response) => frontendModelData(response.data.data));
    }
}