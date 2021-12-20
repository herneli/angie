export const unpackFullCode = (objectCode) => {
    let packageCode = null;
    let code = null;
    let parts = (objectCode || "").split(".");
    if (parts.length > 0) {
        if (parts.length === 1) {
            code = parts[0];
        } else {
            packageCode = parts.slice(0, parts.length - 1).join(".");
            code = parts.slice(parts.length - 1).join(".");
        }
    }
    return [packageCode, code];
};
