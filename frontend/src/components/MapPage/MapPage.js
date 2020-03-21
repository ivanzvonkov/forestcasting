import React, { useState } from "react";
import { GMap } from "./GMap/GMap";
import { AlertMessage } from "./AlertMessage/AlertMessage";
import { Steps, Button, DatePicker, message } from "antd";
import moment from "moment";
import axios from "axios";
import { Input } from "antd";

export const MapPage = ({ selectLocationAndDate }) => {
  const { Step } = Steps;
  const { Search } = Input;
  const { RangePicker } = DatePicker;

  const [current, setCurrent] = useState(0);
  const [validLocationSelected, setValidLocationSelected] = useState(true);
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [rangePickerValue, setRangePickerValue] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(
    "Select a point on the map or search for a location."
  );
  const [endDate, setEndDate] = useState(null);

  const analyze = () => {
    selectLocationAndDate(
      selectedLat,
      selectedLng,
      selectedDate,
      selectedRange,
      endDate,
      selectedLocation
    );
  };

  const calculateRangeInDays = (fromDate, toDate) => {
    return Math.abs(
      moment(fromDate, "YYYY-MM-DD")
        .startOf("day")
        .diff(moment(toDate, "YYYY-MM-DD").add('days', 1).startOf("day"), "days")
    );
  };

  const onPanelChange = value => {
    let from = value[0];
    let to = value[1];

    if (calculateRangeInDays(from, to) > 16) {
      message.info(
        "We recommend selecting a range of 16 days. Your selection has been adjusted accordingly."
      );
      to = moment(from)
        .startOf("day")
        .add(16, "days");
    }
    // set start date
    setSelectedDate(from);
    setEndDate(to);

    // set range
    setSelectedRange(calculateRangeInDays(from, to));
    setRangePickerValue([from, to]);
  };

  const clickMap = event => {
    setSelectedLat(event.lat);
    setSelectedLng(event.lng);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${event.lat},${event.lng}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
      )
      .then(res => {
        let zeroResults = res.data.results.length === 0;
        if(!zeroResults){
          setSelectedLocation(res.data.results[0].formatted_address);
        }else{
          setSelectedLocation('Uknown address');
        }
        
        // Check if selected location is Canada
        if (
          zeroResults ||
          !res.data.results[0].formatted_address.includes("Canada") ||
          res.data.results[0].formatted_address.includes("NT, Canada") ||
          res.data.results[0].formatted_address.includes("NT XOE, Canada") ||
          res.data.results[0].formatted_address.includes("NU, Canada") ||
          res.data.results[0].formatted_address.includes("Yukon") ||
          res.data.results[0].formatted_address.includes("YT YOB") ||
          res.data.results[0].formatted_address.includes("Nunavut X0A, Canada")
        ) {
          message.error(
            "Please select a valid location. Check Forestcasting's \"Supported Areas\" for more information "
          );
          setValidLocationSelected(false);
        } else {
          message.success({content:"Valid location selected.", duration: 0.5});
          setValidLocationSelected(true);
        }
      });
  };

  const disabledDate = current => {
    const start = moment().endOf("day");
    const end = new moment().add(365, "days");
    return !(start.isSameOrBefore(current) && end.isAfter(current));
  };

  const isCalendarDisplayed = current === 1;

  const search = location => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
      )
      .then(res => {
        setSelectedLat(res.data.results[0].geometry.location.lat);
        setSelectedLng(res.data.results[0].geometry.location.lng);
        setSelectedLocation(res.data.results[0].formatted_address);
      });
  };

  return (
    <div>
      <Steps current={current}>
        <Step title="Select Location" />
        <Step title="Select Prediction Date" />
        <Step title="View Analysis" />
      </Steps>
      <div
        style={{
          margin: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Search
          placeholder={selectedLat ? "Search for a location" : selectedLocation}
          onSearch={search}
          enterButton
          style={{ width: "50%" }}
        />
      </div>
      <GMap
        currentPage={isCalendarDisplayed ? "mapDate" : "mapLocation"}
        selectedLat={selectedLat}
        selectedLng={selectedLng}
        onClick={clickMap}
        selectedLocation={
          selectedLat ? "You selected: " + selectedLocation : selectedLocation
        }
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
            value={rangePickerValue}
            onChange={onPanelChange}
            disabledDate={disabledDate}
          />
        </div>
      )}

      <div style={{ paddingTop: "1em", textAlign: "center" }}>
        {!isCalendarDisplayed && (
          <Button type="primary" disabled={!selectedLat || !validLocationSelected} onClick={() => setCurrent(current + 1)}>
            Next
          </Button>
        )}
        {isCalendarDisplayed && (
          <Button
            onClick={() => {
              setCurrent(current - 1);
              setSelectedRange(null);
              setRangePickerValue(null);
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
            disabled={!validLocationSelected}
          >
            Analyze
          </Button>
        )}
      </div>
    </div>
  );
};
