import React from "react";
import T from "i18n-react";
import { Modal } from "antd";
import Form from "@rjsf/antd";

export default function MethodEditor({ expressionPart, onCancel }) {
  return (
    <Modal
      title={T.translate("visual-script.edit_method_parameters")}
      footer={null}
      visible={true}
      onCancel={onCancel}
    >
      <Form
        schema={{
          type: "object",
          properties: {
            var1: { type: "string" },
            var2: { type: "string", format: "date" },
          },
        }}
      />
    </Modal>
  );
}
