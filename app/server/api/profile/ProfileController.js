import { App, BaseController, JsonResponse } from "lisco";
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
            const serv = new UserService();
            const prof = new ProfileService();

            let user = await serv.loadById(request.body.id);
            let jsRes = {}

            if(user && user[0] && user[0].data && user[0].data.profile){
                let profile = await prof.loadById(user[0].data.profile);
                jsRes = new JsonResponse(true, profile, null);
            }else{
                jsRes = new JsonResponse(false, null, null);
            }

            response.json(jsRes.toJson());
            return response;
        } catch (e) {
            next(e);
        }
    }
}
