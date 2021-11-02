import Form from '@rjsf/antd';
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import T from 'i18n-react'
import { Button, PageHeader, Space, Tabs, Tag } from "antd";

import axios from 'axios';
import { v4 as uuid_v4 } from "uuid";

import Channel from './Channel'


import { mdiUndo, mdiRedo } from '@mdi/js';
import Icon from '@mdi/react';


const { TabPane } = Tabs;

const formSchema = {
    schema: {
        "type": "object",
        "required": [
            "name",
            "description"
        ],
        "properties": {
            "name": {
                "type": "string"
            },
            "description": {
                "type": "string"
            }

        }
    },
    uiSchema: {
        "description": { "ui:widget": "textarea" }
    }
};


const Integration = () => {
    let integForm = useRef(null);

    let { state } = useLocation();
    let { id } = useParams();

    let [currentRecord, setCurrentRecord] = useState(null);
    let [activeTab, setActiveTab] = useState();
    let [channels, setChannels] = useState([]);
    let [editing, setEditing] = useState(false);


    useEffect(() => {
        if (state && state.record) {
            setCurrentRecord(state.record);
        } else if (id) {
            loadIntegration(id);
        }
    }, [state]);


    useEffect(() => {
        if (currentRecord) {
            setChannels(currentRecord.channels);
            setActiveTab(currentRecord.channels[0] && currentRecord.channels[0].id)
        }
    }, [currentRecord])


    const loadIntegration = async (identifier) => {
        const response = await axios.get('/integration/' + identifier);

        if (response?.data?.data) {
            setCurrentRecord(response.data.data[0]);
        } else {
            console.error("Not exists!"); //TODO !
            console.error(response.data);
        }
    }


    const onTabChange = activeKey => {
        setActiveTab(activeKey);
    };

    const onTabEdit = (targetKey, action) => {
        tabActions[action](targetKey);
    };


    const saveIntegration = (values) => {
        setEditing(false)
        console.log(values);
    }

    const tabActions = {
        add: () => {
            const channelId = uuid_v4();
            const newChannels = [...channels];
            newChannels.push({ name: 'New Tab', id: channelId, nodes: [] });

            setChannels(newChannels);
        },

        remove: targetKey => {
            let prevIndex = channels.length != 0 ? channels.length - 2 : 0;
            let newActiveKey = channels[prevIndex].id;

            if (activeTab === targetKey) {
                setActiveTab(newActiveKey);
            }

            const newChannels = channels.filter(channel => channel.id !== targetKey);
            setChannels(newChannels);
        }
    }


    return (
        <div>
            {!editing && <div>
                <PageHeader
                    ghost={false}
                    title={`${T.translate('integrations.integration_form_title', { name: currentRecord?.name })} `}
                    subTitle={currentRecord?.description}
                    tags={<Tag color="green">{T.translate("common.enabled")}</Tag>}
                    extra={[
                        <Button key="edit" type='dashed' onClick={() => setEditing(true)}>{T.translate('common.button.edit')}</Button>,
                        <Button key="disable" danger>{T.translate('common.button.cancel')}</Button>,
                        <Button key="enable" type="primary">{T.translate('common.button.save')}</Button>,
                    ]}
                />
            </div>}
            {editing && <div>
                <PageHeader
                    ghost={false}
                    title={`${T.translate('integrations.integration_form_title', { name: currentRecord?.name })} `}
                    tags={<Tag color="green">{T.translate("common.enabled")}</Tag>}
                    extra={[
                        <Button key="cancel" type='dashed' onClick={() => setEditing(false)}>{T.translate('common.button.cancel')}</Button>,
                        <Button key="accept" type='primary' onClick={(e) => {
                            //Forzar el submit del FORM simulando el evento
                            integForm.current.onSubmit({ target: null, currentTarget: null, preventDefault: () => true, persist: () => true })
                        }}>{T.translate('common.button.accept')}</Button>
                    ]}>
                    <div>
                        {currentRecord && <Form
                            ref={integForm}
                            schema={formSchema.schema}
                            formData={currentRecord}
                            uiSchema={formSchema.uiSchema}
                            onChange={e => console.log(e) && setCurrentRecord(e.formData)}
                            onSubmit={(e) => saveIntegration(e)}
                            onError={(e) => console.log(e)}><></></Form>}
                    </div>
                </PageHeader>
            </div>}

            <Tabs
                tabBarExtraContent={<Space size="small">
                    <Button icon={<Icon path={mdiUndo} size={0.6} />} />
                    <Button icon={<Icon path={mdiRedo} size={0.6} />} />
                </Space>}
                type="editable-card"
                onChange={onTabChange}
                activeKey={activeTab}
                onEdit={onTabEdit}>

                {channels.map(channel => (
                    <TabPane tab={channel.name} key={channel.id} closable={true}>
                        <Channel channel={channel} onChannelUpdate={() => { }} />
                    </TabPane>
                ))}
            </Tabs>

        </div>
    )
}



export default Integration;