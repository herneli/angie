import { BaseController, JsonResponse } from "lisco";
import { ScriptDao } from "./ScriptDao";

export class ScriptController extends BaseController {
    configure() {
        this.router.get("/script", (req, res, next) => {
            this.index(req, res, next);
        });

        return this.router;
    }

    index(request, response) {
        let dao = new ScriptDao();
        dao.getMethods();
        response.json({ message: "Hello world 2!" });
    }
}
