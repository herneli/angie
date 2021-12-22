export const unpackFullCode = (objectCode) => {
    let package_code = null;
    let code = null;
    let parts = (objectCode || "").split(".");
    if (parts.length > 0) {
        if (parts.length === 1) {
            code = parts[0];
        } else {
            package_code = parts.slice(0, parts.length - 1).join(".");
            code = parts.slice(parts.length - 1).join(".");
        }
    }
    return [package_code, code];
};
