import Form from "@rjsf/antd";
import { Button, Modal, Popconfirm, Space, Table } from "antd";
import { useRef, useState } from "react";

import T from "i18n-react";

const AdmTable = ({ dataSource, columns, form, enableAdd, enableEdit, enableDelete, onElementEdit, onElementDelete }) => {
    const formEl = useRef(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({});

    const startEdit = (record) => {
        setModalVisible(true);
        setCurrentRecord(record);
    };

    const modalOk = () => {
        setModalVisible(false);
        if (onElementEdit) onElementEdit(currentRecord);
    };

    const modalCancel = () => {
        setModalVisible(false);
        setCurrentRecord({});
    };

    if (enableEdit || enableDelete) {
        columns = [
            ...columns,
            {
                title: "Action",
                key: "action",
                render: (text, record) => (
                    <Space size="middle">
                        {enableEdit && (
                            <Button type="link" onClick={() => startEdit(record)}>
                                Editar
                            </Button>
                        )}
                        {enableDelete && (
                            <Popconfirm title={T.translate("common.question")} onConfirm={() => onElementDelete && onElementDelete(record)}>
                                <Button type="link">Borrar</Button>
                            </Popconfirm>
                        )}
                    </Space>
                ),
            },
        ];
    }

    return (
        <div>
            {/* TODO Filters! */}
            {enableAdd && (
                <Button type="primary" onClick={() => startEdit({})}>
                    Añadir
                </Button>
            )}
            <Table dataSource={dataSource} columns={columns} rowKey={"id"} />

            <Modal
                width={800}
                title="Editar Elemento"
                visible={modalVisible}
                onOk={modalOk}
                onCancel={modalCancel}
                footer={[
                    <Button key="cancel" type="dashed" onClick={() => modalCancel()}>
                        {T.translate("common.button.cancel")}
                    </Button>,
                    <Button
                        key="accept"
                        type="primary"
                        onClick={(e) => {
                            //Forzar el submit del FORM simulando el evento
                            formEl.current.onSubmit({ target: null, currentTarget: null, preventDefault: () => true, persist: () => true });
                        }}>
                        {T.translate("common.button.accept")}
                    </Button>,
                ]}>
                {form && (
                    <Form
                        ref={formEl}
                        schema={form.schema}
                        formData={currentRecord}
                        uiSchema={form.uiSchema}
                        onChange={(e) => setCurrentRecord(e.formData)}
                        onSubmit={() => modalOk()}
                        onError={(e) => console.log(e)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AdmTable;
