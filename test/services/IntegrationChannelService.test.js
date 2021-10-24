import { expect } from 'chai';
import { IntegrationChannelService } from '../../app/server/api/integration_channel';

const channel = {
    "id": "1",
    "name": "Ruta Pruebas",
    "description": "Transformación Genérica",
    "integration_id": "1",
    "created_on": "YYYY-MM-DDT00:00:00.000Z",
    "last_updated": "YYYY-MM-DDT00:00:00.000Z",
    "version": 1,
    "nodes": [
        {
            "id": "1390f776-2324-46e2-ad7d-56d89ea6e1e0",
            "type_id": "85a901c1-b22b-425e-9c5e-94b87fda528e",
            "custom_name": "TCP-MLLP Input",
            "links": [
                {
                    "node_id": "eb49cd7f-7a75-434a-8dad-7767dd1b5b7e",
                    "handle": null
                },
                {
                    "node_id": "00577a49-a1c8-40cc-98b5-772fbca985ab",
                    "handle": null
                },
                {
                    "node_id": "c9a9ec2a-c346-4e7d-b83a-5643cd19c097",
                    "handle": null
                }
            ],
            "position": {
                "x": 135,
                "y": 291
            },
            "data": {
                "hostname": "0.0.0.0",
                "port": 8888
            }
        },
        {
            "id": "eb49cd7f-7a75-434a-8dad-7767dd1b5b7e",
            "type_id": "35f0043438c-2805-4e36-95cb-1369a109e845",
            "custom_name": "Switch",
            "links": [
                {
                    "node_id": "37ce35c8-0ac8-44e1-941c-d07ce7fd2acf",
                    "handle": "out0"
                }
            ],
            "position": {
                "x": 413,
                "y": 312
            },
            "data": {
                "handles": [
                    {
                        "id": "out0",
                        "condition": "true",
                        "to": [
                            "37ce35c8-0ac8-44e1-941c-d07ce7fd2acf"
                        ]
                    }
                ]
            }
        },
        {
            "id": "37ce35c8-0ac8-44e1-941c-d07ce7fd2acf",
            "type_id": "35f0048c-2805-4e36-95cb-1369a109e845",
            "custom_name": "Terser Extractor",
            "links": [
                {
                    "node_id": "c9a9ec2a-c346-4e7d-b83a-5643cd19c097",
                    "handle": null
                },
                {
                    "node_id": "321f2580-f368-4a27-941c-c445fcee344f",
                    "handle": null
                }
            ],
            "position": {
                "x": 659,
                "y": 314
            },
            "data": {
                "terser_path": "/.ORC-2"
            }
        },
        {
            "id": "c9a9ec2a-c346-4e7d-b83a-5643cd19c097",
            "type_id": "e0a4f9f7-0d4b-4fd4-a500-dc944b17f241",
            "custom_name": "Log",
            "links": [],
            "position": {
                "x": 905,
                "y": 170
            },
            "data": {
                "name": "transformed"
            }
        },
        {
            "id": "321f2580-f368-4a27-941c-c445fcee344f",
            "type_id": "a97136c1-68b6-4b97-b6b1-acc692289e3d",
            "custom_name": "HTTP Output",
            "links": [],
            "position": {
                "x": 974,
                "y": 346
            },
            "data": {
                "hostname": "127.0.0.1",
                "port": 8787,
                "query_params": {}
            }
        },
        {
            "id": "00577a49-a1c8-40cc-98b5-772fbca985ab",
            "type_id": "a97136c1-68b6-4b97-b6b1-acc692289e3d",
            "custom_name": "HTTP Output",
            "links": [],
            "position": {
                "x": 414.4872582508458,
                "y": 440.9731207614167
            },
            "data": {
                "hostname": "127.0.0.1",
                "port": 8788,
                "query_params": {
                    "synchronous": "false",
                    "block": "false"
                }
            }
        }
    ]
}

describe('IntegrationChannelService', async () => {

    it('#convertChannelToCamel()', async () => {
        let service = new IntegrationChannelService();

        let route = await service.convertChannelToCamel(channel);

        expect(route).not.to.be.null;

        expect(route).to.be.eq('<routes  xmlns="http://camel.apache.org/schema/spring"><route> <from uri="mllp://0.0.0.0:8888"/> <multicast> <to uri="direct:eb49cd7f-7a75-434a-8dad-7767dd1b5b7e"/>  <to uri="direct:00577a49-a1c8-40cc-98b5-772fbca985ab"/>  <to uri="direct:c9a9ec2a-c346-4e7d-b83a-5643cd19c097"/> </multicast></route><route> <from uri="direct:c9a9ec2a-c346-4e7d-b83a-5643cd19c097"/> <to uri="log:transformed"/> </route><route> <from uri="direct:321f2580-f368-4a27-941c-c445fcee344f"/> <to uri="http://127.0.0.1:8787/"/> </route><route> <from uri="direct:00577a49-a1c8-40cc-98b5-772fbca985ab"/> <to uri="http://127.0.0.1:8788/?block=false&synchronous=false"/> </route></routes>')
    })



})