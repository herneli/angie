export const unpackObjectCode = (objectCode) => {
    let packageCode = null;
    let code = null;
    let parts = (objectCode || "").split(".");
    if (parts.length > 0) {
        if (parts.length === 1) {
            code = parts[0];
        } else {
            packageCode = parts.slice(0, parts.length);
            code = parts.slice(parts.length);
        }
    }
    return [packageCode, code];
};
