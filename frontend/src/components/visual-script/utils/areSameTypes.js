const areSameTypes = (type1, type2) => {
    if (!type1 || !type2) {
        return false;
    }
    if (
        type1.type === type2.type ||
        type1.type === "$any" ||
        type2.type === "$any"
    ) {
        if (type1.type === "object") {
            return type1.objectCode === type2.objectCode;
        } else {
            if (type1.type === "array") {
                return areSameTypes(type1.items, type2.items);
            } else {
                return true;
            }
        }
    } else {
        return false;
    }
};

export default areSameTypes;
