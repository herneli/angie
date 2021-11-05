import { Button } from "antd";
import React from "react";

export default function LogWidget(props) {
    console.log(props);
    return (
        <div>
            Log widget{" "}
            <Button onClick={() => console.log(props)}>Show log</Button>
        </div>
    );
}
