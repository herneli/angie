import Form from '@rjsf/antd';
import { Button, Modal, Space, Table } from 'antd'
import { useState } from 'react';

const AdmTable = ({ dataSource, columns, form, enableAdd, enableEdit, enableDelete, onElementEdit, onElementDelete }) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({});

    const startEdit = (record) => {
        setModalVisible(true);
        setCurrentRecord(record);
    }

    const modalOk = () => {
        setModalVisible(false);
        if (onElementEdit) onElementEdit(currentRecord);
    }

    const modalCancel = () => {
        setModalVisible(false);
        setCurrentRecord({});
    }

    if (enableEdit || enableDelete) {
        columns = [
            ...columns,
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <Space size="middle">
                        {enableEdit && <Button type='link' onClick={() => startEdit(record)}> Editar</Button>}
                        {enableDelete && <Button type='link' onClick={() => onElementDelete(record)}> Borrar</Button>}
                    </Space >
                ),
            }
        ]
    }


    return (
        <div>
            {/* TODO Filters! */}
            {enableAdd && <Button type='primary' onClick={() => startEdit({})}>Añadir</Button>}
            <Table dataSource={dataSource} columns={columns} />


            <Modal width={800} title="Editar Elemento" visible={modalVisible} onOk={modalOk} onCancel={modalCancel} footer={[]}>

                {form && <Form
                    schema={form.schema}
                    formData={currentRecord}
                    uiSchema={form.uiSchema}
                    onChange={e => setCurrentRecord(e.formData)}
                    onSubmit={() => modalOk()}
                    onError={(e) => console.log(e)} />}
            </Modal>
        </div>
    )

}


export default AdmTable;