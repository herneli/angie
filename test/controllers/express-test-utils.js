const fakeResponse = function () {
    this.data = null;
    this.code = null;
    this.headers = {};
    this.setHeader = (key, value) => {
        this.headers[key] = value;
        return this;
    };
    this.status = (code) => {
        this.code = code;
        return this;
    };
    this.json = (jsondata) => {
        this.data = jsondata;
        return this;
    };

    return this;
};

const fakeRequest = function (method, params, query, body) {
    this.method = method;
    this.headers = { authorization: "" };
    this.url = "http://angie/test";
    this.body = body;
    this.params = params;
    this.query = query;
    return this;
};

const fakeNext = (e) => {
    if (e) throw e;
};

export { fakeResponse, fakeRequest, fakeNext };
