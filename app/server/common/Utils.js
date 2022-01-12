export default class Utils {
    parseToken(data) {
        if (data) {
            let token = data.headers.authorization.replace("bearer ", "").replace("Bearer ", "");
            const parts = token.split(".");
            if (parts && parts[0] != "undefined") {
                let part1 = Buffer.from(parts[0], "base64").toString();
                let part2 = Buffer.from(parts[1], "base64").toString();
                const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
                const content = JSON.parse(Buffer.from(parts[1], "base64").toString());
                return [header, content];
            }

            // console.log(decoded);
        }

        return "";
    }
}
