import React from 'react';
import { Alert } from "antd";

export const AlertMessage = ({message}) => (
    <div style={{ marginTop: "10px", fontSize: "18px" }}>
        <Alert message={message}/>
    </div>
);