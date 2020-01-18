import React from "react";
import { Card, Row, Col } from "antd";
import GaugeChart from "react-gauge-chart";

export const ResultsPage = () => (
  //   <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 900 }, 20]}>
  //     {/* <Col span={12}>
  //       <Card title="Risk Meter">
  //         <GaugeChart id="gauge-chart1" />
  //       </Card>
  //     </Col>
  //     <Col span={12}>
  //       <Card title="Info" />
  //       <br />
  //       <Card title="More Info" />
  //     </Col> */}
  //   </Row>

  <div className="center" style={{ height: "90vh", width: "70vw" }}>
    <GaugeChart
      id="gauge-chart1"
      nrOfLevels={20}
      arcWidth={0.3}
      percent={0.89}
      textColor={"black"}
    />
  </div>
);
