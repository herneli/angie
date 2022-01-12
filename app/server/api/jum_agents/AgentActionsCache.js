import { App } from "lisco";
import Cache from "../../common/Cache";

class AgentActionsCache {
    

    /**
     *
     * @param {*} action
     * @param {*} id
     * @returns
     */
    setAction(action, id) {
        return Cache.set(`manual_action_${action}-${id}`, true);
    }

    /**
     *
     * @param {*} action
     * @param {*} id
     * @returns
     */
    async isTrue(action, id) {
        const result = await Cache.get(`manual_action_${action}-${id}`);
        return result && result.data === true;
    }

    /**
     *
     * @param {*} action
     * @param {*} id
     * @returns
     */
    resetAction(action, id) {
        return Cache.del(`manual_action_${action}-${id}`);
    }
}

export default new AgentActionsCache();
