import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Divider,
  Pagination,
  Tabs,
  Steps,
  Progress,
  InputNumber,
  Collapse
} from "antd";

import { Bar, Pie } from "react-chartjs-2";
import { GMap } from "../MapPage/GMap/GMap";
import ReactSpeedometer from "react-d3-speedometer";
import "./styles.css";

export const ResultsPage = ({
  response,
  validRange,
  selectedLocation,
  rangeInDays
}) => {
  const [vicinityWeight, setVicinityWeight] = useState(0.33);
  const [treeWeight, setTreeWeight] = useState(0.33);
  const [areayWeight, setAreaWeight] = useState(0.33);

  const [currentDate, setCurrentDate] = useState(validRange[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { TabPane } = Tabs;
  const { Step } = Steps;
  const { Panel } = Collapse;

  const pieChartData = {
    labels: ["Vicinity", "Tree Coverage", "Protected Area"],
    datasets: [
      {
        data: [vicinityWeight, treeWeight, areayWeight],
        backgroundColor: ["#FF6384", "#4bc0c0", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#4bc0c0", "#FFCE56"]
      }
    ]
  };

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
      measure:
        Math.round(response.specificDate[currentIndex].weather.max_temp) + " °C"
    },
    {
      key: "2",
      weatherField: "Min Temperature",
      measure:
        Math.round(response.specificDate[currentIndex].weather.min_temp) + " °C"
    },
    {
      key: "3",
      weatherField: "Mean Temperature",
      measure:
        Math.round(response.specificDate[currentIndex].weather.mean_temp) +
        " °C"
    },
    {
      key: "4",
      weatherField: "Total Precipitation",
      measure:
        Math.round(response.specificDate[currentIndex].weather.total_precip) +
        " mm"
    },
    {
      key: "5",
      weatherField: "Total Snow",
      measure:
        Math.round(response.specificDate[currentIndex].weather.total_snow) +
        " mm"
    },
    {
      key: "6",
      weatherField: "Wind Gust Speed",
      measure:
        Math.round(response.specificDate[currentIndex].weather.wind_gust_spd) +
        " m/s"
    },
    {
      key: "7",
      weatherField: "Wind Direction",
      measure: response.specificDate[currentIndex].weather.wind_dir + " degrees"
    }
  ];

  const handlePageChange = event => {
    setCurrentDate(
      currentDate
        .startOf("day")
        .add(event - (currentIndex + 1), "day")
        .startOf("day")
    );
    setCurrentIndex(event - 1);
  };

  return (
    <div id="divToPrint" style={{ height: "auto" }}>
      <Steps current={2} style={{ marginBottom: "20px" }}>
        <Step title="Select Location" />
        <Step title="Select Prediction Date" />
        <Step title="View Analysis" />
      </Steps>
      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
        <Col span={12}>
          <Card>
            <h2>{currentDate.format("MMMM Do, YYYY").toString()} Prediction</h2>
            <div className="centered">
              <div className="centered" style={{ margin: "2px" }}>
                <div style={{ color: "@ Black 45%" }}> Predictions Range: </div>
                <Pagination
                  current={currentIndex + 1}
                  simple={true}
                  disabled={false}
                  showLessItems={true}
                  total={rangeInDays}
                  defaultPageSize={1}
                  defaultCurrent={currentIndex + 1}
                  onChange={handlePageChange}
                />
              </div>
            </div>
            <br />
            <Divider orientation="left">Risk Measure</Divider>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                marginTop: "40px"
              }}
            >
              <ReactSpeedometer
                maxValue={100}
                value={Math.round(
                  response.specificDate[currentIndex].riskScore * 100
                )}
                currentValueText={`${Math.round(
                  response.specificDate[currentIndex].riskScore * 100
                )}%`}
                needleColor={"black"}
                startColor={"green"}
                segments={10}
                endColor={"red"}
                needleTransition={"easeElastic"}
              />
            </div>
            <br />
            <Divider orientation="left">Weather Information</Divider>
            <Table
              columns={columns}
              dataSource={weatherData}
              pagination={false}
              showHeader={false}
            />
            <br />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <h2>Possible Damages</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: "40px",
                marginBottom: "40px",
                marginLeft: "35px"
              }}
            >
              <Progress
                type="circle"
                percent={Math.round(
                  parseInt(response.damage.tree_coverage) * treeWeight +
                    parseInt(response.damage.vicinity) * vicinityWeight +
                    parseInt(response.damage.protected_area * areayWeight)
                )}
                width={250}
                strokeColor={{
                  "0%": "#a4cfed",
                  "100%": "#1890ff"
                }}
              />

              <Pie
                data={pieChartData}
                width={340}
                height={200}
                options={{
                  title: {
                    display: true,
                    text: "Weighting"
                  },
                  responsive: false,
                  legend: {
                    display: false
                  }
                }}
              />
            </div>
            <Divider orientation="left">Vicinity</Divider>
            <div className="damage-component-wrapper">
              <div className="damage-component">
                <Progress
                  type="circle"
                  percent={Math.round(parseInt(response.damage.vicinity))}
                  width={100}
                  strokeColor={"#FF6384"}
                />
                <p style={{ margin: "10px" }}>
                  <b>Nearest City:</b> {response.vicinityData.city}
                  <br />
                  <b>Population:</b>{" "}
                  {parseInt(response.vicinityData.population)} people
                  <br />
                  <b>Distance: </b>
                  {parseInt(response.vicinityData.distance)} kilometers
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft: "25px"
                }}
              >
                <div
                  style={{
                    color: "@ Black 45%",
                    fontSize: "14px"
                  }}
                >
                  Weighting:
                </div>
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  value={vicinityWeight}
                  onChange={value => {
                    setVicinityWeight(value);
                    if (vicinityWeight + treeWeight + areayWeight !== 1) {
                      var remainder = (1 - vicinityWeight) / 2;
                      setAreaWeight(remainder);
                      setTreeWeight(remainder);
                    }
                  }}
                />
              </div>
            </div>
            <Divider orientation="left">
              {`${
                response.protectedAreaData.length > 1
                  ? "Protected Areas"
                  : "Protected Area"
              }`}
            </Divider>

            <div className="damage-component-wrapper">
              <div className="damage-component">
                <Progress
                  type="circle"
                  percent={Math.round(parseInt(response.damage.protected_area))}
                  width={100}
                  strokeColor={"#FFCE56"}
                />
                <div style={{ margin: "10px" }}>
                  {response.protectedAreaData.length < 1 ? (
                    <p>No protected areas found in this region.</p>
                  ) : (
                    <Collapse bordered={false} accordion>
                      {response.protectedAreaData.map(function(data, index) {
                        console.log(data, index);
                        return (
                          <Panel
                            header={
                              <p style={{ margin: "0px" }}>{data.area_name}</p>
                            }
                            key={index}
                          >
                            <b>Type:</b> {data.area_type} <br />
                            <b>Authority: </b>
                            {data.mng_auth}
                          </Panel>
                        );
                      })}
                    </Collapse>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft: "25px"
                }}
              >
                <div
                  style={{
                    color: "@ Black 45%",
                    fontSize: "14px"
                  }}
                >
                  Weighting:
                </div>
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  value={areayWeight}
                  onChange={value => {
                    setAreaWeight(value);
                    if (vicinityWeight + treeWeight + areayWeight !== 1) {
                      var remainder = (1 - areayWeight) / 2;
                      setVicinityWeight(remainder);
                      setTreeWeight(remainder);
                    }
                  }}
                />
              </div>
            </div>

            <Divider orientation="left">Tree Coverage</Divider>
            <div className="damage-component-wrapper">
              <div className="damage-component">
                <Progress
                  type="circle"
                  percent={Math.round(parseInt(response.damage.tree_coverage))}
                  width={100}
                  strokeColor={"#4bc0c0"}
                />
                <p style={{ margin: "10px" }}>
                  <b>Vegetation:</b> Not Available
                  <br />
                  <b>Elevation:</b> Not available
                  <br />
                  <b>Water Cover Percentage: </b>
                  Not available
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginLeft: "25px"
                }}
              >
                <div
                  style={{
                    color: "@ Black 45%",
                    fontSize: "14px"
                  }}
                >
                  Weighting:
                </div>
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  value={treeWeight}
                  onChange={value => {
                    setTreeWeight(value);
                    if (vicinityWeight + treeWeight + areayWeight !== 1) {
                      var remainder = (1 - treeWeight) / 2;
                      setAreaWeight(remainder);
                      setVicinityWeight(remainder);
                    }
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
        <Col span={32}>
          <Card>
            <Col span={24}>
              <h2>Ecozone {response.geography.zone} Information</h2>
              {response.geography.description}
            </Col>
            <Col span={12}>
              <Divider orientation="left">Previous Fire Date</Divider>
              Last fire in this location occurred on{" "}
              {response.location.lastFireDate}
              <Tabs
                defaultActiveKey="1"
                tabBarStyle={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center"
                }}
              >
                <TabPane tab="Average Fire Duration" key="1">
                  <Bar
                    data={fireDurationData}
                    width={5}
                    height={320}
                    options={{
                      maintainAspectRatio: false,
                      legend: {
                        display: false
                      }
                    }}
                  />
                </TabPane>
                <TabPane tab="Average Fire Size" key="2">
                  <Bar
                    data={fireSizeData}
                    width={5}
                    height={320}
                    options={{
                      maintainAspectRatio: false,
                      legend: {
                        display: false
                      }
                    }}
                  />
                </TabPane>
              </Tabs>
            </Col>
            <br />
            <Col span={12}>
              <div
                id="fullGoogleMap"
                style={{ display: "block", marginTop: "20px" }}
              >
                <Divider orientation="left">Current Location</Divider>

                <GMap
                  currentPage={"results"}
                  selectedLat={selectedLocation[0]}
                  selectedLng={selectedLocation[1]}
                  selectedLocation={selectedLocation[2]}
                />
              </div>
              <div id="partialGoogleMap" style={{ display: "none" }}>
                <div
                  style={{
                    fontSize: "18px",
                    textAlign: "center",
                    width: "100%"
                  }}
                >
                  <div
                    data-show="true"
                    className="ant-alert ant-alert-success ant-alert-no-icon"
                  >
                    <span className="ant-alert-message">
                      {selectedLocation[2]}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
