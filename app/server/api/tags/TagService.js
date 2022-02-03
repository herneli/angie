import { BaseService } from "../../integration/elastic";
import { TagDao } from "./";

export class TagService extends BaseService {
    constructor() {
        super(TagDao);
    }

}
