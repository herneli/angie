import { BaseKnexDao, KnexConnector } from "lisco";

export default class LdapHostDao extends BaseKnexDao {
    tableName = "ldap_host"



    loadByIdActive(id) {
        return KnexConnector.connection(this.tableName).where({ active: 1 }).andWhere({ id: id });
    }

    loadByIdActive(ids) {
        return KnexConnector.connection(this.tableName).whereIn("id", ids).andWhere({ active: 1 });
    }


}