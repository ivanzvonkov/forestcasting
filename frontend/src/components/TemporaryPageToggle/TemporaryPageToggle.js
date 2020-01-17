import React, { Fragment } from "react";
import { Select } from "antd";

export const TemporaryPageToggle = ({
  pageComponent,
  currentPage,
  setCurrentPage
}) => (
  <Fragment>
    {"Temporary: "}
    <Select defaultValue={currentPage} onChange={setCurrentPage}>
      {Object.keys(pageComponent).map(pageKey => (
        <Select.Option key={pageKey} value={pageKey}>
          {pageKey}
        </Select.Option>
      ))}
    </Select>
  </Fragment>
);
