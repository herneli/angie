import { Utils, BaseService } from 'lisco';
import { CamelComponentService } from '../camel_component';
import { IntegrationChannelDao } from './IntegrationChannelDao';

import Handlebars from 'handlebars';
import lodash from 'lodash';
import * as queryString from 'query-string';
import { NodeTypeService } from '../node_type';

export class IntegrationChannelService extends BaseService {

    constructor() {
        super(IntegrationChannelDao)


        Handlebars.registerHelper('safe', function (inputData) {
            return new Handlebars.SafeString(inputData);
        });
        Handlebars.registerHelper('querystring', function (inputData) {
            return new Handlebars.SafeString(!lodash.isEmpty(inputData) ? "?" + (queryString.stringify(inputData)) : "");
        });
    }



    async convertChannelToCamel(channel) {

        if (!channel || !channel.nodes) {
            throw Error("Cannot parse empty channel or channel without nodes.");
        }

        const camelComponentService = new CamelComponentService();
        const { data: camel_components } = await camelComponentService.list();

        const nodeTypesService = new NodeTypeService();
        const { data: node_types } = await nodeTypesService.list();

        const nodes = lodash.cloneDeep(channel.nodes);

        let camelStr = "";
        for (const idx in nodes) {
            const element = nodes[idx];

            let type = lodash.find(node_types, { id: element.type_id });
            if (!type) continue;
            let camelComponent = lodash.find(camel_components, { id: type.camel_component_id });

            if (camelComponent.xml_template) {
                const template = Handlebars.compile(camelComponent.xml_template);

                camelStr += template({
                    source: element.id,
                    target: (element.links && element.links.length !== 0) ? lodash.map(element.links, 'node_id') : ["empty"],
                    ...element.data
                });
            }

        }


        return (`<routes  xmlns=\"http://camel.apache.org/schema/spring\">${camelStr}</routes>`);

    }

    async getIntegrationChannels(integration) {
        const channels = await this.dao.getIntegrationChannels(integration)
        return { data: channels, total: channels.length };
    }



    async deployChannel(identifier) {
        const channel = await this.dao.loadById(identifier);

        //TODO deploy
        let camelRoute = await this.convertChannelToCamel(channel[0]);
        channel[0].status = 'DEPLOYED';

        return channel;
    }

    async undeployChannel(identifier) {
        const channel = await this.dao.loadById(identifier);


        //TODO deploy
        channel[0].status = 'UNDEPLOYED';

        return channel;
    }

    async channelLogs(identifier) {
        const channel = await this.dao.loadById(identifier);

        channel[0].logs = {}//TODO

        return channel;
    }

    async channelStats(identifier) {
        const channel = await this.dao.loadById(identifier);

        channel[0].stats = {}//TODO

        return channel;
    }

}

