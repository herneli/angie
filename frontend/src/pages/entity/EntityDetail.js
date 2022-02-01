import { Layout, notification } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";

const { Content } = Layout;

const EntityDetail = ({ record }) => {
    const [currentRecord, setCurrentRecord] = useState(record);

    const { state } = useLocation();
    const { id } = useParams();

    useEffect(() => {
        loadElement();
    }, [state]);

    const loadElement = async () => {
        try {
            const response = await axios.get("/entity/" + id);

            if (response) {
                setCurrentRecord(response?.data?.data);
            }
        } catch (ex) {
            notification.error("Se ha producido un error");
            console.error(ex);
        }
    };

    return (
        <Content>
            <pre>{JSON.stringify(currentRecord, null, 2)}</pre>
        </Content>
    );
};

export default EntityDetail;
