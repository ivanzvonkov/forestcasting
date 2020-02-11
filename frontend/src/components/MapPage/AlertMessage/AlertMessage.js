import React from "react";
import { Alert } from "antd";

export const AlertMessage = ({ message, type }) => (
  <div style={{ fontSize: "18px", textAlign: "center", width: "100%" }}>
    <Alert message={message} type={type || "info"} />
  </div>
);
