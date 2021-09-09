import { BaseController, JsonResponse } from 'lisco';
import lodash from 'lodash';
import { UserSettingsService } from './UserSettingsService';

const asyncHandler = require('express-async-handler')

export class UserSettingsController extends BaseController {

    configure() {
        super.configure('user/settings', { service: UserSettingsService });


        this.router.get('/user/settings/:user_id', asyncHandler((req, res, next) => { this.getUserSettings(req, res, next) }));


        return this.router;
    }

    async getUserSettings(request, response) {
        const userSettingsService = new UserSettingsService();
        const data = await userSettingsService.loadByUserId(request.params.user_id);

        const jsRes = new JsonResponse(true, data, "", data.rows.length);
        return response.json(jsRes.toJson());
    }

}
