import axios from "axios";
const { ConcurrencyManager } = require("axios-concurrency");
const MAX_CONCURRENT_REQUESTS = 100;
ConcurrencyManager(axios, MAX_CONCURRENT_REQUESTS);

function frontendModelData(modelData) {
    if(modelData){
        const extendedData = {
            ...modelData.data,
            id: modelData.id,
            created_at: modelData.created_at,
            modified_at: modelData.modified_at,
        };
        return extendedData;
    }
    return null;

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

export function getModelDataList(model, filters) {
    return axios
        .get("/configuration/model/" + model + "/data", {
            params: { filters: filters },
        })
        .then((response) => {
            let ObjectMap = response.data.data.map((modelData) => frontendModelData(modelData));
            ObjectMap.total = response.data.total;
            return ObjectMap;
        });
}

export function getModelData(model, id) {
    return axios.get("/configuration/model/" + model + "/data/" + id.toString()).then((response) => {
        return frontendModelData(response.data.data);
    });
}

export function deleteModelData(model, id) {
    return axios.delete("/configuration/model/" + model + "/data/" + id.toString()).then((response) => {
        return response.data.data;
    });
}

export function saveModelData(model, extendedData, packageData, overwrite = false) {
    let data = backendModelData(extendedData);
    if (packageData) {
        data = {
            ...data,
            package_code: packageData.currentPackage.code,
            package_version: packageData.currentPackage.version,
        };
        delete data.packageCode;
        delete data.packageVersion;
    }
    if (extendedData.id) {
        return axios
            .put("/configuration/model/" + model + "/data/" + extendedData.id.toString(), data)
            .then((response) => frontendModelData(response.data.data));
    } else {
        return axios
            .post("/configuration/model/" + model + "/data/", data)
            .then((response) => frontendModelData(response.data.data));
    }
}
