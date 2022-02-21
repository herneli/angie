export default class Utils {
    static getFiltersByPairs = (filterKey, str) => {
        const regex = /(?<key>[^:|^!:]+)(:|!:)(?<value>[^\s]+)\s?/g; // clave:valor clave2:valor2
        let m;

        let data = {};
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            let { key, value } = m.groups;

            const operator = m[2] || ":";

            let type = "likeI";
            switch (operator) {
                case ":":
                default:
                    type = "likeI";
                    break;
                case "!:":
                    type = "notlikeI";
                    break;
            }

            if (key) {
                data[filterKey(key)] = {
                    type: type,
                    value: `${value}`,
                };
            }
        }
        return data;
    };
}
