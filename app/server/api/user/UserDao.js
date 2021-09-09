import { IUserDao, KnexConnector } from "lisco";
import moment from "moment";

export default class UserDao extends IUserDao {

    tableName = 'users'
    //TODO remove passwords from listAllData and listFilteredData

    async findByUsername(username) {
        const users = await KnexConnector.connection(this.tableName).where({ username: username });
        return users && users[0];
    }


    async loadDuplicate(username) {
        const users = await KnexConnector.connection(this.tableName).where(username, 'ILIKE', username).andWhere({ active: 1 });
        return users;
    }

    async traceLogin(username) {
        return await KnexConnector.connection(this.tableName).where({ username: username }).andWhere({ active: 1 }).update({ last_login_date: moment().toISOString() });
    }
}