import React, { useState } from "react";
import { Card, Row, Col, Table, Calendar } from "antd";
import GaugeChart from "react-gauge-chart";
import { Bar } from "react-chartjs-2";
import { GMap } from "../MapPage/GMap/GMap";

export const ResultsPage = ({ response, validRange, selectedLocation }) => {
  const [currentDate, setCurrentDate] = useState(validRange[0]);
  const [selectedDate, setSelectedDate] = useState(validRange[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      "Location Average",
      "Ecozone " + response.geography.zone + " Average"
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
      "Location Average",
      "Ecozone " + response.geography.zone + " Average"
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
      measure: response.specificDate[currentIndex].weather.max_temp + " °C"
    },
    {
      key: "2",
      weatherField: "Min Temperature",
      measure: response.specificDate[currentIndex].weather.min_temp + " °C"
    },
    {
      key: "3",
      weatherField: "Mean Temperature",
      measure: response.specificDate[currentIndex].weather.mean_temp + " °C"
    },
    {
      key: "4",
      weatherField: "Total Precipitation",
      measure: response.specificDate[currentIndex].weather.total_precip + " mm"
    },
    {
      key: "5",
      weatherField: "Total Snow",
      measure: response.specificDate[currentIndex].weather.total_snow + " mm"
    },
    {
      key: "6",
      weatherField: "Snow Depth",
      measure: response.specificDate[currentIndex].weather.snow_dpth + " mm"
    },
    {
      key: "7",
      weatherField: "Wind Speed",
      measure: response.specificDate[currentIndex].weather.wind_spd + " m/s"
    },
    {
      key: "8",
      weatherField: "Wind Gust Speed",
      measure:
        response.specificDate[currentIndex].weather.wind_gust_spd + " m/s"
    },
    {
      key: "9",
      weatherField: "Wind Direction",
      measure: response.specificDate[currentIndex].weather.wind_dir + " degrees"
    }
  ];

  const handleDateChange = event => {
    setCurrentDate(event);

    // set current index -> if no results exist (ie past 16 days), set to default value =  start of date range
    let index = response.specificDate.findIndex(
      i => i.weather.date === event.format("YYYY-MM-DD")
    );
    setCurrentIndex(index === -1 ? 0 : index);
    setSelectedDate(event);
  };

  const handlePanelChange = event => {
    setSelectedDate(event);
  };

  return (
    <div id="divToPrint" style={{ "height": "180vh" }}>
      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
        <Col span={12}>
          <Card
            title={`Displaying Results For: ${currentDate
              .format("MMMM Do, YYYY")
              .toString()}`}
          >
            <Calendar
              fullscreen={false}
              validRange={validRange}
              onSelect={handleDateChange}
              onChange={handleDateChange}
              onPanelChange={handlePanelChange}
              value={selectedDate}
            />
          </Card>
          <br />
          <Card title="Average Fire Size">
            <Bar
              data={fireSizeData}
              width={5}
              height={320}
              options={{ maintainAspectRatio: false }}
            />
          </Card>
          <br />
          <Card title="Ecozone Information">
            Zone {response.geography.zone}
            <br />
            {response.geography.description}
          </Card>
          <br />
          <Card title="Last Fire Date">
            Last fire in this location occurred on{" "}
            {response.location.lastFireDate}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Risk Measure">
            <GaugeChart
              id="gauge-chart1"
              nrOfLevels={20}
              arcWidth={0.3}
              percent={response.specificDate[currentIndex].riskScore}
              textColor={"black"}
            />
          </Card>
          <br />
          <Card title="Average Fire Duration">
            <Bar
              data={fireDurationData}
              width={5}
              height={320}
              options={{ maintainAspectRatio: false }}
            />
          </Card>
          <br />
          <Card title="Weather Information">
            <Table
              columns={columns}
              dataSource={weatherData}
              pagination={false}
              showHeader={false}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
        <Col span={32}>
          <div id="fullGoogleMap" style={{ "display": "block" }}>
            <GMap
              currentPage={"results"}
              selectedLat={selectedLocation[0]}
              selectedLng={selectedLocation[1]}
              selectedLocation={selectedLocation[2]}
            />
          </div>
          <div id="partialGoogleMap" style={{ "display": "none" }}>
            <div style={{"fontSize": "18px", "textAlign": "center", "width": "100%"}}>
              <div data-show="true" className="ant-alert ant-alert-success ant-alert-no-icon">
                <span className="ant-alert-message">{selectedLocation[2]}</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
     </div>
  );
};
