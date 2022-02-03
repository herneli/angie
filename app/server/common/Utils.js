import { UserService } from "../api/user";

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

    getUsername(request) {
        let header = [];
        let content = [];
        if (request.headers.authorization) {
            [header, content] = this.parseToken(request);
        }
        return content.preferred_username;
    }

    async getOrganizationFilter(request) {
        const username = this.getUsername(request);

        const userServ = new UserService();
        const user = await userServ.loadByUsername(username);
        if (!user) {
            throw "No user found";
        }

        if (user.data.current_organization && user.data.current_organization !== "all") {
            return user.data.current_organization === "assigned"
                ? user.data.organization_id
                : user.data.current_organization;
        }
        return "all";
    }
}
