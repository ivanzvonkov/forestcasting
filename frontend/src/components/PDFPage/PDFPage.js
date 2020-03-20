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
  Progress
} from "antd";
import { Bar } from "react-chartjs-2";
import { GMap } from "../MapPage/GMap/GMap";
import ReactSpeedometer from "react-d3-speedometer";
import "./styles.css";
import moment from "moment";
import {
    PDFViewer,
  BlobProvider,
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";

export const PDFPage = ({
  response,
  validRange,
  selectedLocation,
  rangeInDays
}) => {
  const [currentDate, setCurrentDate] = useState(validRange[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { TabPane } = Tabs;
  const { Step } = Steps;

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

  const styles = StyleSheet.create({
      page: {
        flexDirection: "row"
      },
      section: {
        flexGrow: 1
      }
    });

    const MyDocument = (
      <Document>
          <Page size="A4" style={styles.page}>
          <View style={styles.section}>
                <Steps current={3} style={{ marginBottom: "20px" }}>
                  <Step title="Select Location" />
                  <Step title="Select Prediction Date" />
                  <Step title="View Analysis" />
                </Steps>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                  <Col span={12}>
                    <Card>
                      <Text>{moment(new Date(currentDate)).format("MMMM Do, YYYY")} Prediction</Text>
                      <View className="centered">
                        <View className="centered" style={{ margin: "2px" }}>
                          <View style={{ color: "@ Black 45%" }}> Predictions Range: </View>
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
                        </View>
                      </View>
                      <Divider orientation="left">Risk Measure</Divider>
                      <View
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
                      </View>
                      <Divider orientation="left">Weather Information</Divider>
                      <Table
                        columns={columns}
                        dataSource={weatherData}
                        pagination={false}
                        showHeader={false}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Text>Possible Damages</Text>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "40px"
                        }}
                      >
                        <Progress
                          type="circle"
                          percent={Math.round(
                            parseInt(response.damage.tree_coverage) / 3 +
                              parseInt(response.damage.vicinity) / 3 +
                              parseInt(response.damage.protected_area / 3)
                          )}
                          width={250}
                          strokeColor={{
                            "0%": "#a4cfed",
                            "100%": "#1890ff"
                          }}
                        />
                      </View>
                      <Divider orientation="left">Vicinity</Divider>
                      <View className="damage-component">
                        <Progress
                          type="circle"
                          percent={Math.round(parseInt(response.damage.vicinity))}
                          width={100}
                        />
                        <Text style={{ margin: "10px" }}>
                          Nearest City: {response.vicinityData.city}
                          Population: {parseInt(response.vicinityData.population)}{" "}
                          people
                          Distance:
                          {parseInt(response.vicinityData.distance)} kilometers
                        </Text>
                      </View>
                      <Divider orientation="left">Protected Area</Divider>
                      <View className="damage-component">
                        <Progress
                          type="circle"
                          percent={Math.round(parseInt(response.damage.protected_area))}
                          width={100}
                        />
                        <Text style={{ margin: "10px" }}>
                          Name of Protected Area: Not available
                          Type of Protected Area: Not available
                          Management Authority:
                          Not available
                        </Text>
                      </View>
                      <Divider orientation="left">Tree Coverage</Divider>
                      <View className="damage-component">
                        <Progress
                          type="circle"
                          percent={Math.round(parseInt(response.damage.tree_coverage))}
                          width={100}
                        />
                        <Text style={{ margin: "10px" }}>
                          Type of Vegitation: Not Available
                          Population: Not available
                          Distance:
                          Not available
                        </Text>
                      </View>
                    </Card>
                  </Col>
                </Row>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                  <Col span={32}>
                    <Card>
                      <Col span={24}>
                        <Text>Ecozone {response.geography.zone} Information</Text>
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
                      <Col span={12}>
                        <View
                          id="fullGoogleMap"
                          style={{ display: "block", marginTop: "20px" }}
                        >
                          <Divider orientation="left">Current Location</Divider>

                          <GMap
                            currentPage={"pdf"}
                            selectedLat={selectedLocation[0]}
                            selectedLng={selectedLocation[1]}
                            selectedLocation={selectedLocation[2]}
                          />
                        </View>
                        <View id="partialGoogleMap" style={{ display: "none" }}>
                          <View
                            style={{
                              fontSize: "18px",
                              textAlign: "center",
                              width: "100%"
                            }}
                          >
                            <View
                              data-show="true"
                              className="ant-alert ant-alert-success ant-alert-no-icon"
                            >
                              <View className="ant-alert-message">
                                {selectedLocation[2]}
                              </View>
                            </View>
                          </View>
                        </View>
                      </Col>
                    </Card>
                  </Col>
                </Row>

              </View>
          </Page>
      </Document>
      <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Hello World!</Text>
      </View>
      <View style={styles.section}>
        <Text>We're inside a PDF!</Text>
      </View>
    </Page>
  </Document>
  );

  return (
      <PDFViewer>{MyDocument}</PDFViewer>,
      document.getElementById("root")
  );
};
