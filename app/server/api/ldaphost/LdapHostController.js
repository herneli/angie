import { BaseController, JsonResponse } from 'lisco';
import { LdapHostService } from "./";

const asyncHandler = require('express-async-handler')

export class LdapHostController extends BaseController {

    configure() {
        super.configure('ldap_host', { service: LdapHostService });


        return this.router;
    }

}
