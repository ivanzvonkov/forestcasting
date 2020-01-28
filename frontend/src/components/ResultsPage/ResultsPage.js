import React, { useState } from "react";
import { Card, Row, Col, Table, Button, Radio, Calendar } from "antd";
import GaugeChart from "react-gauge-chart";
import { Bar } from "react-chartjs-2";
import moment from "moment";

export const ResultsPage = ({ response, validRange }) => {
  const [currentDate, setCurrentDate] = useState(validRange[0]);

  const columns = [
    {
      title: "Weather Field",
      dataIndex: "weatherField",
      key: "weatherField"
    },
    {
      title: "Measure",
      dataIndex: "measure",
      key: "Measure"
    }
  ];

  const fireDurationData = {
    labels: [
      "Total Average",
      "Ecoregion " + response.geography.zone + " Average"
    ],
    datasets: [
      {
        label: "Average Fire Duration",
        backgroundColor: "rgba(131, 204, 133,0.4)",
        borderColor: "rgba(41, 125, 44,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(131, 204, 133,0.8)",
        hoverBorderColor: "rgba(41, 125, 44,1)",
        data: [
          response.location.averageFireDuration,
          response.geography.averageFireDurationForZone,
          0
        ]
      }
    ]
  };

  const fireSizeData = {
    labels: [
      "Total Average",
      "Ecoregion " + response.geography.zone + " Average"
    ],
    datasets: [
      {
        label: "Average Fire Size",
        backgroundColor: "rgba(131, 204, 133,0.4)",
        borderColor: "rgba(41, 125, 44,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(131, 204, 133,0.8)",
        hoverBorderColor: "rgba(41, 125, 44,1)",
        data: [
          response.location.averageFireSize,
          response.geography.averageFireSizeForZone,
          0
        ]
      }
    ]
  };

  const weatherData = [
    {
      key: "1",
      weatherField: "Max Temperature",
      measure: response.weather.max_temp
    },
    {
      key: "2",
      weatherField: "Min Temperature",
      measure: response.weather.min_temp
    },
    {
      key: "3",
      weatherField: "Mean Temperature",
      measure: response.weather.mean_temp
    },
    {
      key: "4",
      weatherField: "Total Precipitation",
      measure: response.weather.total_precip
    },
    {
      key: "5",
      weatherField: "Total Snow",
      measure: response.weather.total_snow
    },
    {
      key: "6",
      weatherField: "Snow Depth",
      measure: response.weather.snow_dpth
    },
    {
      key: "7",
      weatherField: "Wind Speed",
      measure: response.weather.wind_spd
    },
    {
      key: "8",
      weatherField: "Wind Gust Speed",
      measure: response.weather.wind_gust_spd
    },
    {
      key: "9",
      weatherField: "Wind Direction",
      measure: response.weather.wind_dir
    }
  ];

  // const createRadioButtons = () => {
  //   let buttons = [];
  //   for (let i = 0; i < dateRange; i++) {
  //     buttons.push(
  //       <Radio.Button value={dateArray[i]} key={i}>
  //         {dateArray[i]}
  //       </Radio.Button>
  //     );
  //   }
  //   return buttons;
  // };

  const handleDateChange = event => {
    console.log(event);
    setCurrentDate(event);
    console.log(currentDate.format("YYYY-MM-DD"));
    const specificDate = currentDate.format("YYYY-MM-DD");
    console.log(response.specificDate.analysisResults.indexOf(specificDate));
    console.log(response.specificDate.analysisResults.specificDate);
  };

  return (
    <div style={{ height: "90vh" }}>
      <Row
        gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 5]}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px"
        }}
      >
        {/* <Radio.Group
          value={dateArray[currentIndex]}
          onChange={handleDateChange}
        >
          {createRadioButtons()}
        </Radio.Group> */}
      </Row>

      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
        <Col span={12}>
          <Card>
            <Calendar
              fullscreen={false}
              validRange={validRange}
              onChange={handleDateChange}
              value={currentDate}
            />
          </Card>
          <br />
          <Card title="Last Fire Date">
            Last fire in this location occured on{" "}
            {response.location.lastFireDate}
          </Card>
          <br />
          <Card title="Ecozone Information">
            Zone {response.geography.zone}
            <br />
            {response.geography.description}
          </Card>
          {/* <br />
       
          <br /> */}
        </Col>
        <Col span={12}>
          <Card title="Risk Measure">
            <GaugeChart
              id="gauge-chart1"
              nrOfLevels={20}
              arcWidth={0.3}
              percent={0.8}
              textColor={"black"}
            />
          </Card>
          {/* <br /> */}
          {/* <Card title="Weather Information">
            <Table
              columns={columns}
              dataSource={weatherData}
              pagination={false}
              showHeader={false}
            />
            {response.weather.weather}
          </Card> */}
          <Card title="Average Fire Duration">
            <Bar
              data={fireDurationData}
              width={5}
              height={300}
              options={{ maintainAspectRatio: false }}
            />
          </Card>
          <br />
          <Card title="Average Fire Size">
            <Bar
              data={fireSizeData}
              width={5}
              height={300}
              options={{ maintainAspectRatio: false }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
