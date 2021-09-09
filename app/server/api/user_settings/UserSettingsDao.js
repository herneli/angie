import { BaseKnexDao, IUserSettingsDao, KnexConnector } from "lisco";

export default class UserSettingsDao extends BaseKnexDao {

    tableName = 'users_settings'

    loadByUserId(userId){
        return KnexConnector.connection(this.tableName).where({ user_id: userId });
    }
}