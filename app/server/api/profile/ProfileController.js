import { App, BaseController, JsonResponse,Utils } from "lisco";
import { ProfileService } from "./ProfileService";

import expressAsyncHandler from "express-async-handler";
import { UserService } from "../user/UserService";

export class ProfileController extends BaseController {
    configure() {
        super.configure("profile", { service: ProfileService });

        this.router.post(
            "/profile/permissions",
            expressAsyncHandler((res, req, next) => {
                this.permissions(res, req, next);
            })
        );

        return this.router;
    }

    async permissions(request, response, next) {
        try {
            const UserServ= new UserService();
            const ProfServ = new ProfileService();
            let menu = require("../../../../config/menu.json")
            
            let user = await UserServ.loadById(request.body.id);
            let jsRes = {};
            let finalMenu = []

            if (user && user[0] && user[0].data && user[0].data.profile) {
                let profile = await ProfServ.loadById(user[0].data.profile);
                if(profile[0].data.sections.length > 0){
                    let sectionsAvailable = profile[0].data.sections;
                    menu.forEach((menuEntry) => {
                        let resp = sectionsAvailable.filter((element) => element == menuEntry.value)                    
                        if(resp.length > 0){
                            finalMenu.push(menuEntry)
                        }
                    });
                    jsRes = new JsonResponse(true, finalMenu, null);
                }
            } else {
                jsRes = new JsonResponse(false, null, null);
            }

            response.json(jsRes);
        } catch (e) {
            next(e);
        }
    }

}
