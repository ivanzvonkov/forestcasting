import React, { useState } from "react";
import { GMap } from "./GMap/GMap";
import { AlertMessage } from "./AlertMessage/AlertMessage";
import { Steps, Button, DatePicker } from "antd";
import moment from "moment";
import axios from "axios";

export const MapPage = ({ selectLocationAndDate }) => {
  const { Step } = Steps;

  const [current, setCurrent] = useState(0);
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);

  const { RangePicker } = DatePicker;

  const [selectedLocation, setSelectedLocation] = useState(
    "Click on the map to select a location."
  );

  const [endDate, setEndDate] = useState(null);

  const analyze = () => {
    selectLocationAndDate(
      selectedLat,
      selectedLng,
      selectedDate,
      selectedRange,
      endDate
    );
  };

  const onPanelChange = value => {
    const from = value[0];
    const to = value[1];

    // set start date
    setSelectedDate(from);
    setEndDate(to);

    // calculate range
    const rangeInDays =
      Math.abs(
        moment(from, "YYYY-MM-DD")
          .startOf("day")
          .diff(moment(to, "YYYY-MM-DD").startOf("day"), "days")
      ) + 1;

    // set range
    setSelectedRange(rangeInDays);
  };

  const clickMap = event => {
    setSelectedLat(event.lat);
    setSelectedLng(event.lng);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${event.lat},${event.lng}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
      )
      .then(res => {
        setSelectedLocation(
          "You selected: " + res.data.results[0].formatted_address
        );
      });
  };

  const disabledDate = current => {
    // can not select days before today
    return current && current < moment().startOf("day");
  };

  const isCalendarDisplayed = current === 1;

  return (
    <>
      <Steps current={current}>
        <Step title="Select Location" />
        <Step title="Select Forecast Date" />
      </Steps>

      <GMap
        isCalendarDisplayed={isCalendarDisplayed}
        selectedLat={selectedLat}
        selectedLng={selectedLng}
        onClick={clickMap}
        selectedLocation={selectedLocation}
      />

      {isCalendarDisplayed && (
        <div
          style={{
            height: "10vh",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center"
          }}
        >
          <AlertMessage
            message={
              selectedRange
                ? `You selected ${
                    selectedRange > 1
                      ? `a range of ${selectedRange} days: `
                      : `a date:`
                  }`
                : "Select a date or a range of dates for prediction:"
            }
            type={selectedRange ? "success" : "info"}
          />

          <RangePicker
            style={{ width: "100%" }}
            size="large"
            onChange={onPanelChange}
            disabledDate={disabledDate}
          />
        </div>
      )}

      <div style={{ paddingTop: "1em", textAlign: "center" }}>
        {!isCalendarDisplayed && selectedLat && (
          <Button type="primary" onClick={() => setCurrent(current + 1)}>
            Next
          </Button>
        )}
        {isCalendarDisplayed && (
          <Button
            onClick={() => {
              setCurrent(current - 1);
              setSelectedRange(null);
            }}
          >
            Previous
          </Button>
        )}
        {isCalendarDisplayed && selectedRange && (
          <Button
            style={{ marginLeft: "1em" }}
            type="primary"
            onClick={analyze}
          >
            Done
          </Button>
        )}
      </div>
    </>
  );
};
